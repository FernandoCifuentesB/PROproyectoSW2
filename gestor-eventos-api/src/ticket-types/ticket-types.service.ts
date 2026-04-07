import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

@Injectable()
export class TicketTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ticketType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id },
    });

    if (!ticketType) {
      throw new NotFoundException('Tipo de entrada no encontrado');
    }

    return ticketType;
  }

  async create(dto: CreateTicketTypeDto) {
    const existing = await this.prisma.ticketType.findUnique({
      where: { name: dto.name.trim() },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un tipo de entrada con ese nombre');
    }

    return this.prisma.ticketType.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateTicketTypeDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.ticketType.findFirst({
        where: {
          name: dto.name.trim(),
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException('Ya existe un tipo de entrada con ese nombre');
      }
    }

    return this.prisma.ticketType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const linked = await this.prisma.eventTicket.count({
      where: { ticketTypeId: id },
    });

    if (linked > 0) {
      throw new BadRequestException(
        'No se puede eliminar el tipo de entrada porque ya está asociado a eventos',
      );
    }

    return this.prisma.ticketType.delete({
      where: { id },
    });
  }
}