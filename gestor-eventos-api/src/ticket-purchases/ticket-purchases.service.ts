import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentEventsGateway } from '@/payment-events/payment-events.gateway';
import { PaymentEventsService } from '@/payment-events/payment-events.service';
import { CreateTicketPurchaseDto } from './dto/create-ticket-purchase.dto';

const ticketPurchaseInclude = {
  event: true,
  eventTicket: {
    include: {
      event: true,
      ticketType: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

type GatewayPaymentResponse = {
  payment?: {
    id?: string;
    status?: string;
    provider?: string;
    providerResponse?: {
      approved?: boolean;
      reason?: string;
      code?: string;
      message?: string;
    };
  };
  message?: string;
  error?: string;
};

@Injectable()
export class TicketPurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentEventsGateway: PaymentEventsGateway,
    private readonly paymentEventsService: PaymentEventsService,
  ) { }

  async create(userId: string, dto: CreateTicketPurchaseDto) {
    const { eventTicketId, quantity, provider, cardNumber, cvv } = dto;

    const eventTicket = await this.prisma.eventTicket.findUnique({
      where: { id: eventTicketId },
      include: {
        event: true,
        ticketType: true,
      },
    });

    if (!eventTicket) {
      throw new NotFoundException('La boleta del evento no fue encontrada');
    }

    if (!eventTicket.isActive) {
      throw new BadRequestException('Esta boleta no está disponible para compra');
    }

    if (!eventTicket.event.isActive) {
      throw new BadRequestException('Este evento no está disponible para compra');
    }

    if (!eventTicket.event.date) {
      throw new BadRequestException('El evento no tiene una fecha válida');
    }

    const now = new Date();
    const eventDate = new Date(eventTicket.event.date);

    if (eventDate.getTime() <= now.getTime()) {
      throw new BadRequestException(
        'Este evento ya finalizó y no está disponible para compra',
      );
    }

    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }

    const available = eventTicket.stock - eventTicket.sold;

    if (available <= 0) {
      throw new BadRequestException('No hay boletas disponibles para esta entrada');
    }

    if (quantity > available) {
      throw new BadRequestException('No hay suficientes boletas disponibles');
    }

    const unitPrice = eventTicket.price;
    const totalPrice = unitPrice * quantity;
    const externalRef = `event-${eventTicket.eventId}-ticket-${eventTicketId}-${Date.now()}`;
    const idempotencyKey = `${userId}-${eventTicketId}-${Date.now()}`;

    this.paymentEventsGateway.emitPaymentStatus({
      status: 'PAYMENT_REQUEST_SENT',
      message: 'Enviando petición a la pasarela de pagos...',
      data: {
        eventTicketId,
        provider,
        amount: totalPrice,
      },
    });

    const paymentResult = await this.sendPaymentToGateway({
      companyId:
        process.env.PAYMENT_COMPANY_ID ||
        '550e8400-e29b-41d4-a716-446655440000',
      externalRef,
      idempotencyKey,
      provider,
      cardNumber,
      cvv,
      amount: totalPrice,
    });

    this.paymentEventsGateway.emitPaymentStatus({
      status: 'PAYMENT_GATEWAY_RESPONSE_RECEIVED',
      message: 'Respuesta recibida desde la pasarela de pagos.',
      data: paymentResult,
    });

    const paymentWasRejected =
      paymentResult.payment?.status === 'RECHAZADO' ||
      paymentResult.payment?.providerResponse?.approved === false;

    if (paymentWasRejected) {
      const rejectionReason =
        paymentResult.payment?.providerResponse?.reason ||
        paymentResult.payment?.providerResponse?.message ||
        paymentResult.message ||
        paymentResult.error ||
        'El pago fue rechazado por la pasarela';

      const technicalCode =
        paymentResult.payment?.providerResponse?.code || 'PAYMENT_REJECTED';

      await this.paymentEventsService.publish('payment.result.created', {
        eventType: 'PAYMENT_FAILED',
        userId,
        eventTicketId,
        provider,
        technicalCode,
        technicalMessage: rejectionReason,
        eventName: eventTicket.event.name,
        ticketTypeName: eventTicket.ticketType.name,
        amount: totalPrice,
      });

      return {
        message: rejectionReason,
        payment: paymentResult.payment,
        purchase: null,
      };
    }

    const purchase = await this.prisma.$transaction(async (tx) => {
      const createdPurchase = await tx.ticketPurchase.create({
        data: {
          userId,
          eventId: eventTicket.eventId,
          eventTicketId,
          quantity,
          unitPrice,
          totalPrice,
          status: PurchaseStatus.CONFIRMED,
        },
        include: ticketPurchaseInclude,
      });

      await tx.eventTicket.update({
        where: { id: eventTicketId },
        data: {
          sold: {
            increment: quantity,
          },
        },
      });

      return createdPurchase;
    });

    await this.paymentEventsService.publish('payment.result.created', {
      eventType: 'PAYMENT_SUCCESS',
      purchaseId: purchase.id,
      userId,
      eventTicketId,
      provider,
      eventName: eventTicket.event.name,
      ticketTypeName: eventTicket.ticketType.name,
      quantity,
      amount: totalPrice,
    });

    return {
      message: 'Compra realizada correctamente',
      purchase,
      payment: paymentResult.payment,
    };
  }

  private async sendPaymentToGateway(payload: {
    companyId: string;
    externalRef: string;
    idempotencyKey: string;
    provider: 'VISA' | 'MASTERCARD' | 'NU';
    cardNumber: string;
    cvv?: string;
    amount: number;
  }): Promise<GatewayPaymentResponse> {
    const gatewayUrl =
      process.env.PAYMENT_GATEWAY_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${gatewayUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as GatewayPaymentResponse;

      if (!response.ok) {
        throw new BadRequestException(
          data?.payment?.providerResponse?.message ||
          data?.payment?.providerResponse?.reason ||
          'La pasarela de pagos rechazó la solicitud',
        );
      }

      return data;
    } catch (error) {
      await this.paymentEventsService.publish('payment.result.created', {
        eventType: 'PAYMENT_TIMEOUT',
        provider: payload.provider,
        technicalCode: 'NETWORK_TIMEOUT',
        technicalMessage:
          error instanceof Error
            ? error.message
            : 'No fue posible conectar con la pasarela de pagos',
        amount: payload.amount,
      });

      throw new BadRequestException(
        'No fue posible conectar correctamente con la pasarela de pagos',
      );
    }
  }

  async findMine(userId: string) {
    return this.prisma.ticketPurchase.findMany({
      where: { userId },
      include: ticketPurchaseInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const purchase = await this.prisma.ticketPurchase.findFirst({
      where: {
        id,
        userId,
      },
      include: ticketPurchaseInclude,
    });

    if (!purchase) {
      throw new NotFoundException('Compra no encontrada');
    }

    return purchase;
  }

  async getEventSalesReport(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventTickets: {
          include: {
            ticketType: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    const rows = event.eventTickets.map((ticket) => {
      const sold = ticket.sold;
      const available = ticket.stock - ticket.sold;
      const revenue = ticket.sold * ticket.price;

      return {
        eventTicketId: ticket.id,
        ticketTypeId: ticket.ticketTypeId,
        ticketTypeName: ticket.ticketType.name,
        unitPrice: ticket.price,
        stock: ticket.stock,
        sold,
        available,
        revenue,
      };
    });

    const totalSold = rows.reduce((sum, row) => sum + row.sold, 0);
    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);

    return {
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
      },
      summary: {
        totalSold,
        totalRevenue,
      },
      rows,
    };
  }

  async getAdminSummary() {
    const totalRevenue = await this.prisma.ticketPurchase.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: PurchaseStatus.CONFIRMED,
      },
    });

    const totalSales = await this.prisma.ticketPurchase.count({
      where: {
        status: PurchaseStatus.CONFIRMED,
      },
    });

    return {
      totalSales,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    };
  }
}