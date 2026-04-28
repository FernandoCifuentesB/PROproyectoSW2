import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { unlink } from "fs/promises";

import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto, UpdateEventDto } from "./dto";

type UploadedImage = {
  filename: string;
};

type EventTicketInput = {
  id?: string;
  ticketTypeId: string;
  price: number;
  stock: number;
  isActive?: boolean;
};

@Injectable()
export class EventsService {
  private readonly topSoldCacheKey = "public_top_3_sold_events";

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getTopSoldPublicEvents() {
    const cached = await this.cacheManager.get<any[]>(this.topSoldCacheKey);

    if (cached) {
      console.log("TOP 3 DESDE CACHE", cached);
      return cached;
    }

    console.log("TOP 3 CONSULTADO DESDE BD");

    const purchases = await this.prisma.ticketPurchase.groupBy({
      by: ["eventId"],
      _sum: {
        quantity: true,
      },
    });

    console.log("COMPRAS AGRUPADAS:", purchases);

    if (!purchases.length) {
      await this.cacheManager.set(this.topSoldCacheKey, [], 1000 * 60 * 5);
      return [];
    }

    const eventIds = purchases.map((row) => row.eventId);

    const events = await this.prisma.event.findMany({
      where: {
        id: { in: eventIds },
        isActive: true,
      },
      include: {
        category: true,
        eventTickets: {
          where: { isActive: true },
          include: {
            ticketType: true,
          },
        },
        _count: {
          select: { interests: true },
        },
      },
    });

    const items = purchases
      .map((row) => {
        const event = events.find((item) => item.id === row.eventId);
        if (!event) return null;

        return {
          ...event,
          interestCount: event._count.interests,
          soldCount: row._sum.quantity ?? 0,
        };
      })
      .filter((event): event is NonNullable<typeof event> => event !== null)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 3);

    console.log(
      "TOP FINAL:",
      items.map((event) => ({
        name: event.name,
        soldCount: event.soldCount,
      })),
    );

    await this.cacheManager.set(this.topSoldCacheKey, items, 1000 * 60 * 5);

    return items;
  }

  async clearTopSoldCache() {
    await this.cacheManager.del(this.topSoldCacheKey);
    console.log("CACHE TOP 3 ELIMINADA");
  }

  async listPublic(query: any) {
    const { page = 1, pageSize = 6 } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {
      isActive: true,
    };

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          name: "asc",
        },
        include: {
          category: true,
          eventTickets: {
            where: { isActive: true },
            include: {
              ticketType: true,
            },
          },
          _count: {
            select: { interests: true },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total,
      items: items.map((event) => ({
        ...event,
        interestCount: event._count.interests,
      })),
    };
  }

  async listAdmin() {
    const items = await this.prisma.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        eventTickets: {
          include: {
            ticketType: true,
          },
        },
        _count: {
          select: { interests: true },
        },
      },
    });

    return items.map((event) => ({
      ...event,
      interestCount: event._count.interests,
    }));
  }

  async get(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        eventTickets: {
          where: { isActive: true },
          include: {
            ticketType: true,
          },
        },
        _count: {
          select: { interests: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Evento no existe");
    }

    return {
      ...event,
      interestCount: event._count.interests,
    };
  }

  async create(dto: CreateEventDto, image?: UploadedImage) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException("categoryId invalido");
    }

    const tickets = await this.parseAndValidateTickets((dto as any).tickets);
    const imageUrl = image ? this.toImageUrl(image) : dto.imageUrl ?? null;
    const minPrice = this.getMinTicketPrice(tickets);

    let createdId: string | null = null;

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const event = await tx.event.create({
          data: {
            name: dto.name,
            description: dto.description,
            date: dto.date,
            categoryId: dto.categoryId,
            imageUrl,
            price: minPrice,
            isActive: true,
          },
        });

        await tx.eventTicket.createMany({
          data: tickets.map((ticket) => ({
            eventId: event.id,
            ticketTypeId: ticket.ticketTypeId,
            price: ticket.price,
            stock: ticket.stock,
            isActive: ticket.isActive ?? true,
          })),
        });

        return event;
      });

      createdId = created.id;
    } catch (error) {
      if (imageUrl) {
        await this.deleteLocalImage(imageUrl);
      }
      throw error;
    }

    await this.clearTopSoldCache();

    return this.get(createdId as string);
  }

  async update(id: string, dto: UpdateEventDto, image?: UploadedImage) {
    const existing = await this.prisma.event.findUnique({
      where: { id },
      include: {
        eventTickets: true,
      },
    });

    if (!existing) {
      throw new NotFoundException("Evento no existe");
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException("categoryId invalido");
      }
    }

    const tickets =
      (dto as any).tickets !== undefined
        ? await this.parseAndValidateTickets((dto as any).tickets, existing.eventTickets)
        : existing.eventTickets.map((ticket) => ({
            id: ticket.id,
            ticketTypeId: ticket.ticketTypeId,
            price: ticket.price,
            stock: ticket.stock,
            isActive: ticket.isActive,
          }));

    const imageUrl = this.resolveUpdatedImageUrl(existing.imageUrl, dto, image);
    const minPrice = this.getMinTicketPrice(tickets);
    const incomingIds = new Set(
      tickets.filter((ticket) => ticket.id).map((ticket) => ticket.id as string),
    );

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const current of existing.eventTickets) {
          if (incomingIds.has(current.id)) continue;
          if (current.sold > 0) {
            throw new BadRequestException(
              `No se puede eliminar una boleta que ya tiene ventas registradas (${current.ticketTypeId})`,
            );
          }
        }

        await tx.event.update({
          where: { id },
          data: {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.date !== undefined ? { date: dto.date } : {}),
            ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
            ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            imageUrl,
            price: minPrice,
          },
        });

        const removableIds = existing.eventTickets
          .filter((ticket) => !incomingIds.has(ticket.id))
          .map((ticket) => ticket.id);

        if (removableIds.length) {
          await tx.eventTicket.deleteMany({
            where: {
              eventId: id,
              id: { in: removableIds },
            },
          });
        }

        for (const ticket of tickets) {
          if (ticket.id) {
            await tx.eventTicket.update({
              where: { id: ticket.id },
              data: {
                price: ticket.price,
                stock: ticket.stock,
                isActive: ticket.isActive ?? true,
              },
            });
            continue;
          }

          await tx.eventTicket.create({
            data: {
              eventId: id,
              ticketTypeId: ticket.ticketTypeId,
              price: ticket.price,
              stock: ticket.stock,
              isActive: ticket.isActive ?? true,
            },
          });
        }
      });
    } catch (error) {
      if (image && imageUrl) {
        await this.deleteLocalImage(imageUrl);
      }
      throw error;
    }

    if (existing.imageUrl && existing.imageUrl !== imageUrl) {
      await this.deleteLocalImage(existing.imageUrl);
    }

    await this.clearTopSoldCache();

    return this.get(id);
  }

  async remove(id: string) {
    await this.get(id);

    const deleted = await this.prisma.event.delete({
      where: { id },
    });

    await this.clearTopSoldCache();

    return deleted;
  }

  private toImageUrl(file: UploadedImage) {
    return `/uploads/events/${file.filename}`;
  }

  private resolveUpdatedImageUrl(
    currentImageUrl: string | null,
    dto: UpdateEventDto,
    image?: UploadedImage,
  ) {
    if (image) return this.toImageUrl(image);
    if ((dto as any).removeImage === "true") return null;
    if (dto.imageUrl !== undefined) return dto.imageUrl || null;
    return currentImageUrl;
  }

  private async parseAndValidateTickets(
    rawTickets: unknown,
    existingTickets: Array<{ id: string; ticketTypeId: string; sold: number }> = [],
  ): Promise<EventTicketInput[]> {
    if (rawTickets === undefined || rawTickets === null || rawTickets === "") {
      throw new BadRequestException("Debe agregar al menos una boleta.");
    }

    let parsed: unknown;

    if (typeof rawTickets === "string") {
      try {
        parsed = JSON.parse(rawTickets);
      } catch {
        throw new BadRequestException("Formato invalido para las boletas.");
      }
    } else {
      parsed = rawTickets;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new BadRequestException("Debe agregar al menos una boleta.");
    }

    const normalized = parsed.map((ticket, index) => {
      if (!ticket || typeof ticket !== "object") {
        throw new BadRequestException(`Boleta invalida en la posicion ${index + 1}.`);
      }

      const candidate = ticket as Record<string, unknown>;
      const normalizedTicket: EventTicketInput = {
        id: typeof candidate.id === "string" ? candidate.id : undefined,
        ticketTypeId: typeof candidate.ticketTypeId === "string" ? candidate.ticketTypeId : "",
        price: Number(candidate.price),
        stock: Number(candidate.stock),
        isActive:
          typeof candidate.isActive === "boolean"
            ? candidate.isActive
            : candidate.isActive === "true"
              ? true
              : candidate.isActive === "false"
                ? false
                : true,
      };

      if (!normalizedTicket.ticketTypeId) {
        throw new BadRequestException(`La boleta ${index + 1} debe tener un tipo.`);
      }

      if (!Number.isInteger(normalizedTicket.price) || normalizedTicket.price <= 0) {
        throw new BadRequestException(`La boleta ${index + 1} debe tener un precio valido.`);
      }

      if (!Number.isInteger(normalizedTicket.stock) || normalizedTicket.stock < 0) {
        throw new BadRequestException(`La boleta ${index + 1} debe tener un stock valido.`);
      }

      return normalizedTicket;
    });

    const seenTypes = new Set<string>();
    for (const ticket of normalized) {
      if (seenTypes.has(ticket.ticketTypeId)) {
        throw new BadRequestException("No se puede repetir el tipo de boleta en un mismo evento.");
      }
      seenTypes.add(ticket.ticketTypeId);
    }

    const validTypes = await this.prisma.ticketType.findMany({
      where: {
        id: { in: normalized.map((ticket) => ticket.ticketTypeId) },
      },
      select: { id: true },
    });

    if (validTypes.length !== normalized.length) {
      throw new BadRequestException("Uno o mas tipos de boleta no existen.");
    }

    const existingById = new Map(existingTickets.map((ticket) => [ticket.id, ticket]));

    for (const ticket of normalized) {
      if (!ticket.id) continue;

      const existing = existingById.get(ticket.id);

      if (!existing) {
        throw new BadRequestException("Se recibio una boleta inexistente para actualizar.");
      }

      if (existing.ticketTypeId !== ticket.ticketTypeId) {
        throw new BadRequestException("No se puede cambiar el tipo de una boleta existente.");
      }

      if (ticket.stock < existing.sold) {
        throw new BadRequestException(
          `El stock no puede quedar por debajo de lo vendido (${existing.sold}).`,
        );
      }
    }

    return normalized;
  }

  private getMinTicketPrice(tickets: EventTicketInput[]) {
    return tickets.reduce((min, ticket) => Math.min(min, ticket.price), tickets[0].price);
  }

  private async deleteLocalImage(imageUrl: string) {
    if (!imageUrl.startsWith("/uploads/events/")) return;

    try {
      await unlink(`.${imageUrl}`);
    } catch {
      // Ignora errores al limpiar archivos huerfanos.
    }
  }
}
