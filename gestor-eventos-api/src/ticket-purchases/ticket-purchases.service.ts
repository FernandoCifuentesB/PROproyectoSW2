import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
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

@Injectable()
export class TicketPurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTicketPurchaseDto) {
    const { eventTicketId, quantity } = dto;

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
      throw new BadRequestException(
        'No hay suficientes boletas disponibles',
      );
    }

    const unitPrice = eventTicket.price;
    const totalPrice = unitPrice * quantity;

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

    return {
      message: 'Compra realizada correctamente',
      purchase,
    };
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