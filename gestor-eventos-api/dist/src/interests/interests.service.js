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
        await this.prisma.interest.create({
            data: { userId, eventId },
        });
        const count = await this.prisma.interest.count({ where: { eventId } });
        return { interested: true, interestCount: count };
    }
    async reportTop() {
        const events = await this.prisma.event.findMany({
            orderBy: { interests: { _count: "desc" } },
            include: { _count: { select: { interests: true } }, category: true },
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
};
exports.InterestsService = InterestsService;
exports.InterestsService = InterestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InterestsService);
//# sourceMappingURL=interests.service.js.map