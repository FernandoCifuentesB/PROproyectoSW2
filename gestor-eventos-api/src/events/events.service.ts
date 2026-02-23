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

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async listPublic(q: PublicQuery) {
    const page = Number(q.page || 1);
    const pageSize = Number(q.pageSize || 6);
    const skip = (page - 1) * pageSize;

    const where: any = { isActive: true };

    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: "insensitive" } },
        { description: { contains: q.search, mode: "insensitive" } },
      ];
    }

    if (q.categoryId) where.categoryId = q.categoryId;

    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.price = {};
      if (q.minPrice !== undefined) where.price.gte = q.minPrice;
      if (q.maxPrice !== undefined) where.price.lte = q.maxPrice;
    }

    if (q.fromDate || q.toDate) {
      where.date = {};
      if (q.fromDate) where.date.gte = new Date(q.fromDate);
      if (q.toDate) where.date.lte = new Date(q.toDate);
    }

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
      items: items.map(e => ({ ...e, interestCount: e._count.interests })),
    };
  }

  async listAdmin() {
    const items = await this.prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, _count: { select: { interests: true } } },
    });
    return items.map(e => ({ ...e, interestCount: e._count.interests }));
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

    return this.prisma.event.create({
      data: {
        name: dto.name,
        description: dto.description,
        date: new Date(dto.date),
        price: dto.price,
        imageUrl: dto.imageUrl,
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

    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.event.delete({ where: { id } });
  }
}