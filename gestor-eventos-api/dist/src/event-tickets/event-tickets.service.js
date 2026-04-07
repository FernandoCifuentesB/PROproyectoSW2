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
exports.EventTicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EventTicketsService = class EventTicketsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEvent(eventId) {
        await this.ensureEventExists(eventId);
        return this.prisma.eventTicket.findMany({
            where: { eventId },
            include: {
                ticketType: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async findAvailableByEvent(eventId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event || !event.isActive) {
            throw new common_1.NotFoundException('Evento no encontrado o inactivo');
        }
        return this.prisma.eventTicket.findMany({
            where: {
                eventId,
                isActive: true,
                ticketType: { isActive: true },
            },
            include: {
                ticketType: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async create(eventId, dto) {
        await this.ensureEventExists(eventId);
        const ticketType = await this.prisma.ticketType.findUnique({
            where: { id: dto.ticketTypeId },
        });
        if (!ticketType) {
            throw new common_1.NotFoundException('Tipo de entrada no encontrado');
        }
        const duplicate = await this.prisma.eventTicket.findUnique({
            where: {
                eventId_ticketTypeId: {
                    eventId,
                    ticketTypeId: dto.ticketTypeId,
                },
            },
        });
        if (duplicate) {
            throw new common_1.BadRequestException('Ese tipo de entrada ya fue registrado para el evento');
        }
        return this.prisma.eventTicket.create({
            data: {
                eventId,
                ticketTypeId: dto.ticketTypeId,
                price: dto.price,
                stock: dto.stock,
                isActive: dto.isActive ?? true,
            },
            include: {
                ticketType: true,
            },
        });
    }
    async update(eventId, eventTicketId, dto) {
        const eventTicket = await this.prisma.eventTicket.findFirst({
            where: {
                id: eventTicketId,
                eventId,
            },
            include: {
                ticketType: true,
            },
        });
        if (!eventTicket) {
            throw new common_1.NotFoundException('Entrada del evento no encontrada');
        }
        if (dto.stock !== undefined && dto.stock < eventTicket.sold) {
            throw new common_1.BadRequestException(`No se puede reducir el stock por debajo de lo vendido (${eventTicket.sold})`);
        }
        return this.prisma.eventTicket.update({
            where: { id: eventTicketId },
            data: {
                ...(dto.price !== undefined ? { price: dto.price } : {}),
                ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
                ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            },
            include: {
                ticketType: true,
            },
        });
    }
    async remove(eventId, eventTicketId) {
        const eventTicket = await this.prisma.eventTicket.findFirst({
            where: {
                id: eventTicketId,
                eventId,
            },
        });
        if (!eventTicket) {
            throw new common_1.NotFoundException('Entrada del evento no encontrada');
        }
        if (eventTicket.sold > 0) {
            throw new common_1.BadRequestException('No se puede eliminar una entrada que ya tiene ventas registradas');
        }
        return this.prisma.eventTicket.delete({
            where: { id: eventTicketId },
        });
    }
    async ensureEventExists(eventId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        return event;
    }
};
exports.EventTicketsService = EventTicketsService;
exports.EventTicketsService = EventTicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventTicketsService);
//# sourceMappingURL=event-tickets.service.js.map