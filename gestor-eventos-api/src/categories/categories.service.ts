import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { events: true } } },
    });
  }

  async get(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException("Categoría no existe");
    return cat;
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.get(id);

    if (dto.isActive === false) {
      const activeEvents = await this.prisma.event.count({
        where: { categoryId: id, isActive: true },
      });
      if (activeEvents > 0) {
        throw new BadRequestException("No se puede desactivar: tiene eventos activos asociados.");
      }
    }

    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.category.delete({ where: { id } });
  }
}