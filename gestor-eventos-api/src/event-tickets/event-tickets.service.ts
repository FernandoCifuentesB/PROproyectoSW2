import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateEventTicketDto } from './dto/create-event-ticket.dto';
import { UpdateEventTicketDto } from './dto/update-event-ticket.dto';

@Injectable()
export class EventTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEvent(eventId: string) {
    await this.ensureEventExists(eventId);

    return this.prisma.eventTicket.findMany({
      where: { eventId },
      include: {
        ticketType: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findAvailableByEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || !event.isActive) {
      throw new NotFoundException('Evento no encontrado o inactivo');
    }

    return this.prisma.eventTicket.findMany({
      where: {
        eventId,
        isActive: true,
        ticketType: { isActive: true },
      },
      include: {
        ticketType: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async create(eventId: string, dto: CreateEventTicketDto) {
    await this.ensureEventExists(eventId);

    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id: dto.ticketTypeId },
    });

    if (!ticketType) {
      throw new NotFoundException('Tipo de entrada no encontrado');
    }

    const duplicate = await this.prisma.eventTicket.findUnique({
      where: {
        eventId_ticketTypeId: {
          eventId,
          ticketTypeId: dto.ticketTypeId,
        },
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        'Ese tipo de entrada ya fue registrado para el evento',
      );
    }

    return this.prisma.eventTicket.create({
      data: {
        eventId,
        ticketTypeId: dto.ticketTypeId,
        price: dto.price,
        stock: dto.stock,
        isActive: dto.isActive ?? true,
      },
      include: {
        ticketType: true,
      },
    });
  }

  async update(eventId: string, eventTicketId: string, dto: UpdateEventTicketDto) {
    const eventTicket = await this.prisma.eventTicket.findFirst({
      where: {
        id: eventTicketId,
        eventId,
      },
      include: {
        ticketType: true,
      },
    });

    if (!eventTicket) {
      throw new NotFoundException('Entrada del evento no encontrada');
    }

    if (dto.stock !== undefined && dto.stock < eventTicket.sold) {
      throw new BadRequestException(
        `No se puede reducir el stock por debajo de lo vendido (${eventTicket.sold})`,
      );
    }

    return this.prisma.eventTicket.update({
      where: { id: eventTicketId },
      data: {
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: {
        ticketType: true,
      },
    });
  }

  async remove(eventId: string, eventTicketId: string) {
    const eventTicket = await this.prisma.eventTicket.findFirst({
      where: {
        id: eventTicketId,
        eventId,
      },
    });

    if (!eventTicket) {
      throw new NotFoundException('Entrada del evento no encontrada');
    }

    if (eventTicket.sold > 0) {
      throw new BadRequestException(
        'No se puede eliminar una entrada que ya tiene ventas registradas',
      );
    }

    return this.prisma.eventTicket.delete({
      where: { id: eventTicketId },
    });
  }

  private async ensureEventExists(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    return event;
  }
}