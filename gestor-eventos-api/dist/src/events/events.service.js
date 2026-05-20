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
const promises_1 = require("fs/promises");
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
            console.log("TOP 3 DESDE CACHE", cached);
            return cached;
        }
        console.log("TOP 3 CONSULTADO DESDE BD");
        const purchases = await this.prisma.ticketPurchase.groupBy({
            by: ["eventId"],
            _sum: {
                quantity: true,
            },
        });
        console.log("COMPRAS AGRUPADAS:", purchases);
        if (!purchases.length) {
            await this.cacheManager.set(this.topSoldCacheKey, [], 1000 * 60 * 5);
            return [];
        }
        const eventIds = purchases.map((row) => row.eventId);
        const events = await this.prisma.event.findMany({
            where: {
                id: { in: eventIds },
                isActive: true,
                date: {
                    gt: new Date(),
                },
            },
            include: {
                category: true,
                eventTickets: {
                    where: { isActive: true },
                    include: { ticketType: true },
                },
                _count: {
                    select: { interests: true },
                },
            },
        });
        const items = purchases
            .map((row) => {
            const event = events.find((item) => item.id === row.eventId);
            if (!event)
                return null;
            return {
                ...event,
                interestCount: event._count.interests,
                soldCount: row._sum.quantity ?? 0,
            };
        })
            .filter((event) => event !== null)
            .sort((a, b) => b.soldCount - a.soldCount)
            .slice(0, 3);
        console.log("TOP FINAL:", items.map((event) => ({
            name: event.name,
            soldCount: event.soldCount,
        })));
        await this.cacheManager.set(this.topSoldCacheKey, items, 1000 * 60 * 5);
        return items;
    }
    async clearTopSoldCache() {
        await this.cacheManager.del(this.topSoldCacheKey);
        console.log("CACHE TOP 3 ELIMINADA");
    }
    async listPublic(query) {
        const { page = 1, pageSize = 6, search, categoryId, minPrice, maxPrice, fromDate, toDate, } = query;
        const now = new Date();
        const where = {
            isActive: true,
        };
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (search?.trim()) {
            where.OR = [
                { name: { contains: search.trim(), mode: "insensitive" } },
                { description: { contains: search.trim(), mode: "insensitive" } },
                {
                    category: {
                        name: { contains: search.trim(), mode: "insensitive" },
                    },
                },
            ];
        }
        if (fromDate || toDate) {
            where.date = {};
            if (fromDate) {
                where.date.gte = new Date(fromDate);
            }
            if (toDate) {
                const endDate = new Date(toDate);
                endDate.setHours(23, 59, 59, 999);
                where.date.lte = endDate;
            }
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.eventTickets = {
                some: {
                    isActive: true,
                    price: {
                        ...(minPrice !== undefined && !Number.isNaN(minPrice)
                            ? { gte: Number(minPrice) }
                            : {}),
                        ...(maxPrice !== undefined && !Number.isNaN(maxPrice)
                            ? { lte: Number(maxPrice) }
                            : {}),
                    },
                },
            };
        }
        const events = await this.prisma.event.findMany({
            where,
            include: {
                category: true,
                eventTickets: {
                    where: { isActive: true },
                    include: { ticketType: true },
                },
                _count: {
                    select: { interests: true },
                },
            },
        });
        const sorted = events
            .map((event) => ({
            ...event,
            interestCount: event._count.interests,
            isExpired: new Date(event.date).getTime() <= now.getTime(),
        }))
            .sort((a, b) => {
            if (a.isExpired !== b.isExpired) {
                return a.isExpired ? 1 : -1;
            }
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        const total = sorted.length;
        const skip = (page - 1) * pageSize;
        const items = sorted.slice(skip, skip + pageSize);
        return {
            page,
            pageSize,
            total,
            items,
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
        return items.map((event) => ({
            ...event,
            interestCount: event._count.interests,
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
    async create(dto, image) {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) {
            throw new common_1.BadRequestException("categoryId invalido");
        }
        const tickets = await this.parseAndValidateTickets(dto.tickets);
        const imageUrl = image ? this.toImageUrl(image) : dto.imageUrl ?? null;
        const minPrice = this.getMinTicketPrice(tickets);
        let createdId = null;
        try {
            const created = await this.prisma.$transaction(async (tx) => {
                const event = await tx.event.create({
                    data: {
                        name: dto.name,
                        description: dto.description,
                        date: dto.date,
                        categoryId: dto.categoryId,
                        imageUrl,
                        price: minPrice,
                        isActive: true,
                    },
                });
                await tx.eventTicket.createMany({
                    data: tickets.map((ticket) => ({
                        eventId: event.id,
                        ticketTypeId: ticket.ticketTypeId,
                        price: ticket.price,
                        stock: ticket.stock,
                        isActive: ticket.isActive ?? true,
                    })),
                });
                return event;
            });
            createdId = created.id;
        }
        catch (error) {
            if (imageUrl) {
                await this.deleteLocalImage(imageUrl);
            }
            throw error;
        }
        await this.clearTopSoldCache();
        return this.get(createdId);
    }
    async update(id, dto, image) {
        const existing = await this.prisma.event.findUnique({
            where: { id },
            include: {
                eventTickets: true,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException("Evento no existe");
        }
        if (dto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) {
                throw new common_1.BadRequestException("categoryId invalido");
            }
        }
        const tickets = dto.tickets !== undefined
            ? await this.parseAndValidateTickets(dto.tickets, existing.eventTickets)
            : existing.eventTickets.map((ticket) => ({
                id: ticket.id,
                ticketTypeId: ticket.ticketTypeId,
                price: ticket.price,
                stock: ticket.stock,
                isActive: ticket.isActive,
            }));
        const imageUrl = this.resolveUpdatedImageUrl(existing.imageUrl, dto, image);
        const minPrice = this.getMinTicketPrice(tickets);
        const incomingIds = new Set(tickets.filter((ticket) => ticket.id).map((ticket) => ticket.id));
        try {
            await this.prisma.$transaction(async (tx) => {
                for (const current of existing.eventTickets) {
                    if (incomingIds.has(current.id))
                        continue;
                    if (current.sold > 0) {
                        throw new common_1.BadRequestException(`No se puede eliminar una boleta que ya tiene ventas registradas (${current.ticketTypeId})`);
                    }
                }
                await tx.event.update({
                    where: { id },
                    data: {
                        ...(dto.name !== undefined ? { name: dto.name } : {}),
                        ...(dto.description !== undefined ? { description: dto.description } : {}),
                        ...(dto.date !== undefined ? { date: dto.date } : {}),
                        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
                        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
                        imageUrl,
                        price: minPrice,
                    },
                });
                const removableIds = existing.eventTickets
                    .filter((ticket) => !incomingIds.has(ticket.id))
                    .map((ticket) => ticket.id);
                if (removableIds.length) {
                    await tx.eventTicket.deleteMany({
                        where: {
                            eventId: id,
                            id: { in: removableIds },
                        },
                    });
                }
                for (const ticket of tickets) {
                    if (ticket.id) {
                        await tx.eventTicket.update({
                            where: { id: ticket.id },
                            data: {
                                price: ticket.price,
                                stock: ticket.stock,
                                isActive: ticket.isActive ?? true,
                            },
                        });
                        continue;
                    }
                    await tx.eventTicket.create({
                        data: {
                            eventId: id,
                            ticketTypeId: ticket.ticketTypeId,
                            price: ticket.price,
                            stock: ticket.stock,
                            isActive: ticket.isActive ?? true,
                        },
                    });
                }
            });
        }
        catch (error) {
            if (image && imageUrl) {
                await this.deleteLocalImage(imageUrl);
            }
            throw error;
        }
        if (existing.imageUrl && existing.imageUrl !== imageUrl) {
            await this.deleteLocalImage(existing.imageUrl);
        }
        await this.clearTopSoldCache();
        return this.get(id);
    }
    async remove(id) {
        await this.get(id);
        const deleted = await this.prisma.event.delete({
            where: { id },
        });
        await this.clearTopSoldCache();
        return deleted;
    }
    toImageUrl(file) {
        return `/uploads/events/${file.filename}`;
    }
    resolveUpdatedImageUrl(currentImageUrl, dto, image) {
        if (image)
            return this.toImageUrl(image);
        if (dto.removeImage === "true")
            return null;
        if (dto.imageUrl !== undefined)
            return dto.imageUrl || null;
        return currentImageUrl;
    }
    async parseAndValidateTickets(rawTickets, existingTickets = []) {
        if (rawTickets === undefined || rawTickets === null || rawTickets === "") {
            throw new common_1.BadRequestException("Debe agregar al menos una boleta.");
        }
        let parsed;
        if (typeof rawTickets === "string") {
            try {
                parsed = JSON.parse(rawTickets);
            }
            catch {
                throw new common_1.BadRequestException("Formato invalido para las boletas.");
            }
        }
        else {
            parsed = rawTickets;
        }
        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new common_1.BadRequestException("Debe agregar al menos una boleta.");
        }
        const normalized = parsed.map((ticket, index) => {
            if (!ticket || typeof ticket !== "object") {
                throw new common_1.BadRequestException(`Boleta invalida en la posicion ${index + 1}.`);
            }
            const candidate = ticket;
            const normalizedTicket = {
                id: typeof candidate.id === "string" ? candidate.id : undefined,
                ticketTypeId: typeof candidate.ticketTypeId === "string" ? candidate.ticketTypeId : "",
                price: Number(candidate.price),
                stock: Number(candidate.stock),
                isActive: typeof candidate.isActive === "boolean"
                    ? candidate.isActive
                    : candidate.isActive === "true"
                        ? true
                        : candidate.isActive === "false"
                            ? false
                            : true,
            };
            if (!normalizedTicket.ticketTypeId) {
                throw new common_1.BadRequestException(`La boleta ${index + 1} debe tener un tipo.`);
            }
            if (!Number.isInteger(normalizedTicket.price) || normalizedTicket.price <= 0) {
                throw new common_1.BadRequestException(`La boleta ${index + 1} debe tener un precio valido.`);
            }
            if (!Number.isInteger(normalizedTicket.stock) || normalizedTicket.stock < 0) {
                throw new common_1.BadRequestException(`La boleta ${index + 1} debe tener un stock valido.`);
            }
            return normalizedTicket;
        });
        const seenTypes = new Set();
        for (const ticket of normalized) {
            if (seenTypes.has(ticket.ticketTypeId)) {
                throw new common_1.BadRequestException("No se puede repetir el tipo de boleta en un mismo evento.");
            }
            seenTypes.add(ticket.ticketTypeId);
        }
        const validTypes = await this.prisma.ticketType.findMany({
            where: {
                id: { in: normalized.map((ticket) => ticket.ticketTypeId) },
            },
            select: { id: true },
        });
        if (validTypes.length !== normalized.length) {
            throw new common_1.BadRequestException("Uno o mas tipos de boleta no existen.");
        }
        const existingById = new Map(existingTickets.map((ticket) => [ticket.id, ticket]));
        for (const ticket of normalized) {
            if (!ticket.id)
                continue;
            const existing = existingById.get(ticket.id);
            if (!existing) {
                throw new common_1.BadRequestException("Se recibio una boleta inexistente para actualizar.");
            }
            if (existing.ticketTypeId !== ticket.ticketTypeId) {
                throw new common_1.BadRequestException("No se puede cambiar el tipo de una boleta existente.");
            }
            if (ticket.stock < existing.sold) {
                throw new common_1.BadRequestException(`El stock no puede quedar por debajo de lo vendido (${existing.sold}).`);
            }
        }
        return normalized;
    }
    getMinTicketPrice(tickets) {
        return tickets.reduce((min, ticket) => Math.min(min, ticket.price), tickets[0].price);
    }
    async deleteLocalImage(imageUrl) {
        if (!imageUrl.startsWith("/uploads/events/"))
            return;
        try {
            await (0, promises_1.unlink)(`.${imageUrl}`);
        }
        catch {
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], EventsService);
//# sourceMappingURL=events.service.js.map