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
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPublic(q) {
        const page = Number(q.page || 1);
        const pageSize = Number(q.pageSize || 6);
        const skip = (page - 1) * pageSize;
        const where = { isActive: true };
        if (q.search) {
            where.OR = [
                { name: { contains: q.search, mode: "insensitive" } },
                { description: { contains: q.search, mode: "insensitive" } },
            ];
        }
        if (q.categoryId)
            where.categoryId = q.categoryId;
        if (q.minPrice !== undefined || q.maxPrice !== undefined) {
            where.price = {};
            if (q.minPrice !== undefined)
                where.price.gte = q.minPrice;
            if (q.maxPrice !== undefined)
                where.price.lte = q.maxPrice;
        }
        if (q.fromDate || q.toDate) {
            where.date = {};
            if (q.fromDate)
                where.date.gte = new Date(q.fromDate);
            if (q.toDate)
                where.date.lte = new Date(q.toDate);
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
    async update(id, dto) {
        await this.get(id);
        if (dto.categoryId) {
            const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
            if (!cat)
                throw new common_1.BadRequestException("categoryId inválido");
            if (!cat.isActive)
                throw new common_1.BadRequestException("La categoría está inactiva");
        }
        return this.prisma.event.update({
            where: { id },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
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