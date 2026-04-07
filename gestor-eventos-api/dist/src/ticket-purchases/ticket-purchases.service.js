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
const prisma_service_1 = require("../prisma/prisma.service");
let TicketPurchasesService = class TicketPurchasesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const eventTicket = await tx.eventTicket.findUnique({
                where: { id: dto.eventTicketId },
                include: {
                    event: true,
                    ticketType: true,
                },
            });
            if (!eventTicket) {
                throw new common_1.NotFoundException('Tipo de entrada del evento no encontrado');
            }
            if (!eventTicket.event.isActive) {
                throw new common_1.BadRequestException('No se pueden comprar entradas para un evento inactivo');
            }
            if (!eventTicket.isActive) {
                throw new common_1.BadRequestException('Este tipo de entrada no está disponible');
            }
            if (!eventTicket.ticketType.isActive) {
                throw new common_1.BadRequestException('El tipo de entrada no está disponible');
            }
            const available = eventTicket.stock - eventTicket.sold;
            if (available <= 0) {
                throw new common_1.BadRequestException('Las entradas están agotadas');
            }
            if (dto.quantity > available) {
                throw new common_1.BadRequestException(`Solo hay ${available} entradas disponibles para este tipo`);
            }
            const updatedEventTicket = await tx.eventTicket.update({
                where: { id: eventTicket.id },
                data: {
                    sold: {
                        increment: dto.quantity,
                    },
                },
            });
            const purchase = await tx.ticketPurchase.create({
                data: {
                    userId,
                    eventId: eventTicket.eventId,
                    eventTicketId: eventTicket.id,
                    quantity: dto.quantity,
                    unitPrice: eventTicket.price,
                    totalPrice: eventTicket.price * dto.quantity,
                    status: 'CONFIRMED',
                },
                include: {
                    event: true,
                    eventTicket: {
                        include: {
                            ticketType: true,
                        },
                    },
                },
            });
            return {
                message: updatedEventTicket.stock - updatedEventTicket.sold === 0
                    ? 'Compra realizada. Este tipo de entrada quedó agotado'
                    : 'Compra realizada correctamente',
                purchase,
            };
        });
    }
    async findMine(userId) {
        return this.prisma.ticketPurchase.findMany({
            where: { userId },
            include: {
                event: true,
                eventTicket: {
                    include: {
                        ticketType: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
};
exports.TicketPurchasesService = TicketPurchasesService;
exports.TicketPurchasesService = TicketPurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketPurchasesService);
//# sourceMappingURL=ticket-purchases.service.js.map