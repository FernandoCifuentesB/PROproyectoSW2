import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateTicketPurchaseDto } from './dto/create-ticket-purchase.dto';
import { EventsService } from '@/events/events.service';
} from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";
import { CreateTicketPurchaseDto } from "./dto/create-ticket-purchase.dto";
import { EventsService } from "@/events/events.service";

@Injectable()
export class TicketPurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async create(userId: string, dto: CreateTicketPurchaseDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const eventTicket = await tx.eventTicket.findUnique({
        where: { id: dto.eventTicketId },
        include: {
          event: true,
          ticketType: true,
        },
      });

      if (!eventTicket) {
        throw new NotFoundException('Tipo de entrada del evento no encontrado');
      }

      if (!eventTicket.event) {
        throw new NotFoundException('Evento no encontrado');
      }

      if (!eventTicket.event.isActive) {
        throw new BadRequestException(
          'No se pueden comprar entradas para un evento inactivo',
        );
      }

      if (!eventTicket.isActive) {
        throw new BadRequestException(
          'Este tipo de entrada no está disponible',
        );
      }

      if (!eventTicket.ticketType.isActive) {
        throw new BadRequestException('El tipo de entrada está inactivo');
      }

      if (dto.quantity <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a cero');
      }

      const available = eventTicket.stock - eventTicket.sold;

      if (available <= 0) {
        throw new BadRequestException('Las entradas están agotadas');
      }

      if (dto.quantity > available) {
        throw new BadRequestException(
          `Solo hay ${available} entradas disponibles para este tipo`,
        );
      }

      await tx.eventTicket.update({
        where: { id: eventTicket.id },
        data: {
          sold: {
            increment: dto.quantity,
          },
        },
      });

      const purchase = await tx.ticketPurchase.create({
        data: {
          userId: user.id,
          eventId: eventTicket.eventId,
          eventTicketId: eventTicket.id,
          quantity: dto.quantity,
          unitPrice: eventTicket.price,
          totalPrice: eventTicket.price * dto.quantity,
          status: 'CONFIRMED',
        },
        include: {
          event: true,
          eventTicket: {
            include: {
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
        },
      });

      const remaining = available - dto.quantity;

      return {
        message:
          remaining === 0
            ? 'Compra realizada. Este tipo de entrada quedó agotado'
            : 'Compra realizada correctamente',
        purchase,
      };
    });

    await this.eventsService.clearTopSoldCache();

    return result;
  }

  async findMine(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.ticketPurchase.findMany({
      where: { userId: user.id },
      include: {
        event: true,
        eventTicket: {
          include: {
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
        event: true,
        eventTicket: {
          include: {
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

  async getAdminSummary() {
    const [revenue, registeredUsers, events] = await Promise.all([
      this.prisma.ticketPurchase.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalPrice: true },
      }),
      this.prisma.user.count({
        where: { role: 'USER' },
      }),
      this.prisma.event.findMany({
        select: {
          id: true,
          date: true,
          isActive: true,
        },
      }),
    ]);

    const now = new Date();

    return {
      totalRevenue: revenue._sum.totalPrice ?? 0,
      activeEvents: events.filter(
        (event) => event.isActive && new Date(event.date) >= now,
      ).length,
      pastEvents: events.filter((event) => new Date(event.date) < now).length,
      registeredUsers,
    };
  }
}
