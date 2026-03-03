import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto, UpdateEventDto } from "./dto";

type PublicQuery = {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  fromDate?: string;
  toDate?: string;
};

function safeInt(n: unknown, fallback: number) {
  const x = typeof n === "number" ? n : Number(n);
  return Number.isFinite(x) ? Math.trunc(x) : fallback;
}

function safeDate(value?: string) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async listPublic(q: PublicQuery) {
    // page/pageSize seguros (evita NaN, 0, negativos)
    const page = Math.max(1, safeInt(q.page, 1));
    const pageSize = Math.min(50, Math.max(1, safeInt(q.pageSize, 6)));
    const skip = (page - 1) * pageSize;

    const where: any = { isActive: true };

    if (q.search?.trim()) {
      const s = q.search.trim();
      where.OR = [
        { name: { contains: s, mode: "insensitive" } },
        { description: { contains: s, mode: "insensitive" } },
      ];
    }

    if (q.categoryId) where.categoryId = q.categoryId;

    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      const min = q.minPrice !== undefined && Number.isFinite(q.minPrice) ? q.minPrice : undefined;
      const max = q.maxPrice !== undefined && Number.isFinite(q.maxPrice) ? q.maxPrice : undefined;

      if (min !== undefined || max !== undefined) {
        where.price = {};
        if (min !== undefined) where.price.gte = min;
        if (max !== undefined) where.price.lte = max;
      }
    }

    const from = safeDate(q.fromDate);
    const to = safeDate(q.toDate);
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to) where.date.lte = to;
    }

    try {
      const [items, total] = await Promise.all([
        this.prisma.event.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: [{ date: "asc" }, { createdAt: "desc" }],
          include: {
            category: true,
            _count: { select: { interests: true } },
          },
        }),
        this.prisma.event.count({ where }),
      ]);

      return {
        page,
        pageSize,
        total,
        items: items.map((e) => ({ ...e, interestCount: e._count.interests })),
      };
    } catch (err) {
      // Esto fuerza a que veas el error real en consola
      console.error("❌ Error en listPublic (/events/public):", err);
      throw err;
    }
  }

  async listAdmin() {
    const items = await this.prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, _count: { select: { interests: true } } },
    });
    return items.map((e) => ({ ...e, interestCount: e._count.interests }));
  }

  async get(id: string) {
    const ev = await this.prisma.event.findUnique({
      where: { id },
      include: { category: true, _count: { select: { interests: true } } },
    });
    if (!ev) throw new NotFoundException("Evento no existe");
    return { ...ev, interestCount: ev._count.interests };
  }

  async create(dto: CreateEventDto) {
    const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!cat) throw new BadRequestException("categoryId inválido");
    if (!cat.isActive) throw new BadRequestException("La categoría está inactiva");

    const d = new Date(dto.date);
    if (Number.isNaN(d.getTime())) throw new BadRequestException("date inválida");

    return this.prisma.event.create({
      data: {
        name: dto.name.trim(),
        description: dto.description.trim(),
        date: d,
        price: dto.price,
        imageUrl: dto.imageUrl ?? null,
        categoryId: dto.categoryId,
        isActive: true,
      },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.get(id);

    if (dto.categoryId) {
      const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!cat) throw new BadRequestException("categoryId inválido");
      if (!cat.isActive) throw new BadRequestException("La categoría está inactiva");
    }

    let newDate: Date | undefined = undefined;
    if (dto.date) {
      const d = new Date(dto.date);
      if (Number.isNaN(d.getTime())) throw new BadRequestException("date inválida");
      newDate = d;
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        name: dto.name ? dto.name.trim() : undefined,
        description: dto.description ? dto.description.trim() : undefined,
        date: newDate,
      },
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.event.delete({ where: { id } });
  }
}