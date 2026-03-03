"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InterestsService = class InterestsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async toggle(userId, eventId) {
        const ev = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!ev)
            throw new common_1.NotFoundException("Evento no existe");
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
    async myFavorites(userId) {
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
    async getUsersByEvent(eventId) {
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
        if (!ev)
            throw new common_1.NotFoundException("Evento no existe");
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
};
exports.InterestsService = InterestsService;
exports.InterestsService = InterestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InterestsService);
//# sourceMappingURL=interests.service.js.map