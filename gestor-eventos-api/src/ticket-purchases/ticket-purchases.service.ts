import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTicketPurchaseDto } from './dto/create-ticket-purchase.dto';

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

    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero');
    }

    const available = eventTicket.stock - eventTicket.sold;

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
          status: PurchaseStatus.PENDING,
        },
        include: {
          eventTicket: {
            include: {
              event: true,
              ticketType: true,
            },
          },
        },
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

    return purchase;
  }

  async findMine(userId: string) {
    return this.prisma.ticketPurchase.findMany({
      where: { userId },
      include: {
        eventTicket: {
          include: {
            event: true,
            ticketType: true,
          },
        },
      },
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
      include: {
        eventTicket: {
          include: {
            event: true,
            ticketType: true,
          },
        },
      },
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