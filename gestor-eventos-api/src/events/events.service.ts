import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto, UpdateEventDto } from "./dto";

@Injectable()
export class EventsService {
  private readonly topSoldCacheKey = "public_top_3_sold_events";

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // ===============================
  // 🔥 TOP 3 MÁS VENDIDOS (CACHE)
  // ===============================
  async getTopSoldPublicEvents() {
    const cached = await this.cacheManager.get<any[]>(this.topSoldCacheKey);

    if (cached) {
      console.log("✅ TOP 3 DESDE CACHE", cached);
      return cached;
    }

    console.log("🟡 TOP 3 CONSULTADO DESDE BD");

    const purchases = await this.prisma.ticketPurchase.groupBy({
      by: ["eventId"],
      _sum: {
        quantity: true,
      },
    });

    console.log("🧾 COMPRAS AGRUPADAS:", purchases);

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
        const event = events.find((e) => e.id === row.eventId);
        if (!event) return null;

        return {
          ...event,
          interestCount: event._count.interests,
          soldCount: row._sum.quantity ?? 0,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 3);

    console.log(
      "🏆 TOP FINAL:",
      items.map((e) => ({
        name: e.name,
        soldCount: e.soldCount,
      })),
    );

    await this.cacheManager.set(this.topSoldCacheKey, items, 1000 * 60 * 5);

    return items;
  }

  // ===============================
  // 🧹 LIMPIAR CACHE
  // ===============================
  async clearTopSoldCache() {
    await this.cacheManager.del(this.topSoldCacheKey);
    console.log("🗑️ CACHE TOP 3 ELIMINADA");
  }

  // ===============================
  // 🌐 PUBLIC LIST (ORDEN ALFABÉTICO)
  // ===============================
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
          name: "asc", // 🔥 AQUÍ ESTÁ EL FIX
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
      items: items.map((e) => ({
        ...e,
        interestCount: e._count.interests,
      })),
    };
  }

  // ===============================
  // 🔥 ADMIN LIST
  // ===============================
  async listAdmin() {
    const items = await this.prisma.event.findMany({
      orderBy: {
        createdAt: "desc", // admin mantiene orden por creación
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

    return items.map((e) => ({
      ...e,
      interestCount: e._count.interests,
    }));
  }

  // ===============================
  // 🔍 GET ONE
  // ===============================
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

  // ===============================
  // ➕ CREATE
  // ===============================
  async create(dto: CreateEventDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException("categoryId inválido");
    }

    return this.prisma.event.create({
      data: {
        ...dto,
        isActive: true,
      },
    });
  }

  // ===============================
  // ✏️ UPDATE
  // ===============================
  async update(id: string, dto: UpdateEventDto) {
    await this.get(id);

    const updated = await this.prisma.event.update({
      where: { id },
      data: dto,
    });

    await this.clearTopSoldCache();

    return updated;
  }


  async remove(id: string) {
    await this.get(id);

    const deleted = await this.prisma.event.delete({
      where: { id },
    });

    await this.clearTopSoldCache();

    return deleted;
  }
}