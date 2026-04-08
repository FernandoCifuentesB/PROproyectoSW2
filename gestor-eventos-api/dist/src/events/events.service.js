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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../prisma/prisma.service");
let EventsService = class EventsService {
    prisma;
    cacheManager;
    topSoldCacheKey = "public_top_3_sold_events";
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async getTopSoldPublicEvents() {
        const cached = await this.cacheManager.get(this.topSoldCacheKey);
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
            if (!event)
                return null;
            return {
                ...event,
                interestCount: event._count.interests,
                soldCount: row._sum.quantity ?? 0,
            };
        })
            .filter((e) => e !== null)
            .sort((a, b) => b.soldCount - a.soldCount)
            .slice(0, 3);
        console.log("🏆 TOP FINAL:", items.map((e) => ({
            name: e.name,
            soldCount: e.soldCount,
        })));
        await this.cacheManager.set(this.topSoldCacheKey, items, 1000 * 60 * 5);
        return items;
    }
    async clearTopSoldCache() {
        await this.cacheManager.del(this.topSoldCacheKey);
        console.log("🗑️ CACHE TOP 3 ELIMINADA");
    }
    async listPublic(query) {
        const { page = 1, pageSize = 6 } = query;
        const skip = (page - 1) * pageSize;
        const where = {
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
            items: items.map((e) => ({
                ...e,
                interestCount: e._count.interests,
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
        return items.map((e) => ({
            ...e,
            interestCount: e._count.interests,
        }));
    }
    async get(id) {
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
            throw new common_1.NotFoundException("Evento no existe");
        }
        return {
            ...event,
            interestCount: event._count.interests,
        };
    }
    async create(dto) {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) {
            throw new common_1.BadRequestException("categoryId inválido");
        }
        return this.prisma.event.create({
            data: {
                ...dto,
                isActive: true,
            },
        });
    }
    async update(id, dto) {
        await this.get(id);
        const updated = await this.prisma.event.update({
            where: { id },
            data: dto,
        });
        await this.clearTopSoldCache();
        return updated;
    }
    async remove(id) {
        await this.get(id);
        const deleted = await this.prisma.event.delete({
            where: { id },
        });
        await this.clearTopSoldCache();
        return deleted;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], EventsService);
//# sourceMappingURL=events.service.js.map