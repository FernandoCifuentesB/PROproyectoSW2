import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ToggleInterestDto } from "./dto";

@Injectable()
export class InterestsService {
  constructor(private prisma: PrismaService) {}

  async toggle(dto: ToggleInterestDto) {
    const ev = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
    if (!ev) throw new NotFoundException("Evento no existe");

    const existing = await this.prisma.interest.findUnique({
      where: { userId_eventId: { userId: dto.userId, eventId: dto.eventId } },
    });

    if (existing) {
      await this.prisma.interest.delete({ where: { id: existing.id } });
      const count = await this.prisma.interest.count({ where: { eventId: dto.eventId } });
      return { interested: false, interestCount: count };
    }

    await this.prisma.interest.create({
      data: { userId: dto.userId, eventId: dto.eventId },
    });

    const count = await this.prisma.interest.count({ where: { eventId: dto.eventId } });
    return { interested: true, interestCount: count };
  }

  async reportTop() {
    const events = await this.prisma.event.findMany({
      orderBy: { interests: { _count: "desc" } },
      include: { _count: { select: { interests: true } }, category: true },
    });

    return events.map(e => ({
      eventId: e.id,
      name: e.name,
      category: e.category.name,
      interestCount: e._count.interests,
      date: e.date,
      price: e.price,
    }));
  }
}