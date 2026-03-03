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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function safeInt(n, fallback) {
    const x = typeof n === "number" ? n : Number(n);
    return Number.isFinite(x) ? Math.trunc(x) : fallback;
}
function safeDate(value) {
    if (!value)
        return undefined;
    const d = new Date(value);
    if (Number.isNaN(d.getTime()))
        return undefined;
    return d;
}
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPublic(q) {
        const page = Math.max(1, safeInt(q.page, 1));
        const pageSize = Math.min(50, Math.max(1, safeInt(q.pageSize, 6)));
        const skip = (page - 1) * pageSize;
        const where = { isActive: true };
        if (q.search?.trim()) {
            const s = q.search.trim();
            where.OR = [
                { name: { contains: s, mode: "insensitive" } },
                { description: { contains: s, mode: "insensitive" } },
            ];
        }
        if (q.categoryId)
            where.categoryId = q.categoryId;
        if (q.minPrice !== undefined || q.maxPrice !== undefined) {
            const min = q.minPrice !== undefined && Number.isFinite(q.minPrice) ? q.minPrice : undefined;
            const max = q.maxPrice !== undefined && Number.isFinite(q.maxPrice) ? q.maxPrice : undefined;
            if (min !== undefined || max !== undefined) {
                where.price = {};
                if (min !== undefined)
                    where.price.gte = min;
                if (max !== undefined)
                    where.price.lte = max;
            }
        }
        const from = safeDate(q.fromDate);
        const to = safeDate(q.toDate);
        if (from || to) {
            where.date = {};
            if (from)
                where.date.gte = from;
            if (to)
                where.date.lte = to;
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
        }
        catch (err) {
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
    async get(id) {
        const ev = await this.prisma.event.findUnique({
            where: { id },
            include: { category: true, _count: { select: { interests: true } } },
        });
        if (!ev)
            throw new common_1.NotFoundException("Evento no existe");
        return { ...ev, interestCount: ev._count.interests };
    }
    async create(dto) {
        const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
        if (!cat)
            throw new common_1.BadRequestException("categoryId inválido");
        if (!cat.isActive)
            throw new common_1.BadRequestException("La categoría está inactiva");
        const d = new Date(dto.date);
        if (Number.isNaN(d.getTime()))
            throw new common_1.BadRequestException("date inválida");
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
    async update(id, dto) {
        await this.get(id);
        if (dto.categoryId) {
            const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
            if (!cat)
                throw new common_1.BadRequestException("categoryId inválido");
            if (!cat.isActive)
                throw new common_1.BadRequestException("La categoría está inactiva");
        }
        let newDate = undefined;
        if (dto.date) {
            const d = new Date(dto.date);
            if (Number.isNaN(d.getTime()))
                throw new common_1.BadRequestException("date inválida");
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
    async remove(id) {
        await this.get(id);
        return this.prisma.event.delete({ where: { id } });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map