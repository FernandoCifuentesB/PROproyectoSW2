import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InterestsService {
  constructor(private prisma: PrismaService) { }

  async toggle(userId: string, eventId: string) {
    const ev = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!ev) throw new NotFoundException("Evento no existe");

    const existing = await this.prisma.interest.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existing) {
      await this.prisma.interest.delete({ where: { id: existing.id } });
      const count = await this.prisma.interest.count({ where: { eventId } });
      return { interested: false, interestCount: count };
    }

    await this.prisma.interest.create({ data: { userId, eventId } });

    const count = await this.prisma.interest.count({ where: { eventId } });
    return { interested: true, interestCount: count };
  }

  // ✅ USER: Mis favoritos (eventos que me interesan)
  async myFavorites(userId: string) {
    const rows = await this.prisma.interest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        event: {
          include: {
            category: true,
            _count: { select: { interests: true } },
          },
        },
      },
    });

    // Devuelve lista de eventos con info extra
    return rows.map((r) => ({
      eventId: r.event.id,
      name: r.event.name,
      description: r.event.description,
      date: r.event.date,
      price: r.event.price,
      imageUrl: r.event.imageUrl,
      category: r.event.category,
      interestCount: r.event._count.interests,
      interestedAt: r.createdAt,
    }));
  }

  // ✅ ADMIN: Eventos + usuarios interesados por evento
  async reportByEvent() {
    const events = await this.prisma.event.findMany({
      orderBy: { interests: { _count: "desc" } },
      include: {
        category: true,
        _count: { select: { interests: true } },
        interests: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, email: true, role: true } },
          },
        },
      },
    });

    return events.map((e) => ({
      eventId: e.id,
      name: e.name,
      category: e.category.name,
      date: e.date,
      price: e.price,
      interestCount: e._count.interests,
      users: e.interests.map((i) => ({
        id: i.user.id,
        email: i.user.email,
        role: i.user.role,
        interestedAt: i.createdAt,
      })),
    }));
  }

  async reportTop() {
    const events = await this.prisma.event.findMany({
      orderBy: { interests: { _count: "desc" } },
      include: {
        category: true,
        _count: { select: { interests: true } },
      },
    });

    return events.map((e) => ({
      eventId: e.id,
      name: e.name,
      category: e.category.name,
      interestCount: e._count.interests,
      date: e.date,
      price: e.price,
    }));
  }

  async getUsersByEvent(eventId: string) {
    const ev = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        category: true,
        interests: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, email: true, role: true } },
          },
        },
        _count: { select: { interests: true } },
      },
    });

    if (!ev) throw new NotFoundException("Evento no existe");

    return {
      eventId: ev.id,
      name: ev.name,
      category: ev.category.name,
      interestCount: ev._count.interests,
      users: ev.interests.map((i) => ({
        id: i.user.id,
        email: i.user.email,
        role: i.user.role,
        interestedAt: i.createdAt,
      })),
    };
  }

}