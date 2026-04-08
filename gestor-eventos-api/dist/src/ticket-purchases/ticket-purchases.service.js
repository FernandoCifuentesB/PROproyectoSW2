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
exports.TicketPurchasesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const ticketPurchaseInclude = {
    event: true,
    eventTicket: {
        include: {
            event: true,
            ticketType: true,
        },
    },
    user: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
};
let TicketPurchasesService = class TicketPurchasesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const { eventTicketId, quantity } = dto;
        const eventTicket = await this.prisma.eventTicket.findUnique({
            where: { id: eventTicketId },
            include: {
                event: true,
                ticketType: true,
            },
        });
        if (!eventTicket) {
            throw new common_1.NotFoundException('La boleta del evento no fue encontrada');
        }
        if (quantity <= 0) {
            throw new common_1.BadRequestException('La cantidad debe ser mayor a cero');
        }
        const available = eventTicket.stock - eventTicket.sold;
        if (quantity > available) {
            throw new common_1.BadRequestException('No hay suficientes boletas disponibles');
        }
        const unitPrice = eventTicket.price;
        const totalPrice = unitPrice * quantity;
        const purchase = await this.prisma.$transaction(async (tx) => {
            const createdPurchase = await tx.ticketPurchase.create({
                data: {
                    userId,
                    eventId: eventTicket.eventId,
                    eventTicketId,
                    quantity,
                    unitPrice,
                    totalPrice,
                    status: client_1.PurchaseStatus.CONFIRMED,
                },
                include: ticketPurchaseInclude,
            });
            await tx.eventTicket.update({
                where: { id: eventTicketId },
                data: {
                    sold: {
                        increment: quantity,
                    },
                },
            });
            return createdPurchase;
        });
        return {
            message: 'Compra realizada correctamente',
            purchase,
        };
    }
    async findMine(userId) {
        return this.prisma.ticketPurchase.findMany({
            where: { userId },
            include: ticketPurchaseInclude,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id, userId) {
        const purchase = await this.prisma.ticketPurchase.findFirst({
            where: {
                id,
                userId,
            },
            include: ticketPurchaseInclude,
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Compra no encontrada');
        }
        return purchase;
    }
    async getEventSalesReport(eventId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                eventTickets: {
                    include: {
                        ticketType: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        const rows = event.eventTickets.map((ticket) => {
            const sold = ticket.sold;
            const available = ticket.stock - ticket.sold;
            const revenue = ticket.sold * ticket.price;
            return {
                eventTicketId: ticket.id,
                ticketTypeId: ticket.ticketTypeId,
                ticketTypeName: ticket.ticketType.name,
                unitPrice: ticket.price,
                stock: ticket.stock,
                sold,
                available,
                revenue,
            };
        });
        const totalSold = rows.reduce((sum, row) => sum + row.sold, 0);
        const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
        return {
            event: {
                id: event.id,
                name: event.name,
                date: event.date,
            },
            summary: {
                totalSold,
                totalRevenue,
            },
            rows,
        };
    }
    async getAdminSummary() {
        const totalRevenue = await this.prisma.ticketPurchase.aggregate({
            _sum: {
                totalPrice: true,
            },
            where: {
                status: client_1.PurchaseStatus.CONFIRMED,
            },
        });
        const totalSales = await this.prisma.ticketPurchase.count({
            where: {
                status: client_1.PurchaseStatus.CONFIRMED,
            },
        });
        return {
            totalSales,
            totalRevenue: totalRevenue._sum.totalPrice || 0,
        };
    }
};
exports.TicketPurchasesService = TicketPurchasesService;
exports.TicketPurchasesService = TicketPurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketPurchasesService);
//# sourceMappingURL=ticket-purchases.service.js.map