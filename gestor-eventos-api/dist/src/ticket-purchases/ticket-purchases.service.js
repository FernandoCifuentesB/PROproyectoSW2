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
const payment_events_gateway_1 = require("../payment-events/payment-events.gateway");
const payment_events_service_1 = require("../payment-events/payment-events.service");
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
    paymentEventsGateway;
    paymentEventsService;
    constructor(prisma, paymentEventsGateway, paymentEventsService) {
        this.prisma = prisma;
        this.paymentEventsGateway = paymentEventsGateway;
        this.paymentEventsService = paymentEventsService;
    }
    async create(userId, dto) {
        const { eventTicketId, quantity, provider, cardNumber, cvv } = dto;
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
        if (!eventTicket.isActive) {
            throw new common_1.BadRequestException('Esta boleta no está disponible para compra');
        }
        if (!eventTicket.event.isActive) {
            throw new common_1.BadRequestException('Este evento no está disponible para compra');
        }
        if (!eventTicket.event.date) {
            throw new common_1.BadRequestException('El evento no tiene una fecha válida');
        }
        const now = new Date();
        const eventDate = new Date(eventTicket.event.date);
        if (eventDate.getTime() <= now.getTime()) {
            throw new common_1.BadRequestException('Este evento ya finalizó y no está disponible para compra');
        }
        if (quantity <= 0) {
            throw new common_1.BadRequestException('La cantidad debe ser mayor a cero');
        }
        const available = eventTicket.stock - eventTicket.sold;
        if (available <= 0) {
            throw new common_1.BadRequestException('No hay boletas disponibles para esta entrada');
        }
        if (quantity > available) {
            throw new common_1.BadRequestException('No hay suficientes boletas disponibles');
        }
        const unitPrice = eventTicket.price;
        const totalPrice = unitPrice * quantity;
        const externalRef = `event-${eventTicket.eventId}-ticket-${eventTicketId}-${Date.now()}`;
        const idempotencyKey = `${userId}-${eventTicketId}-${Date.now()}`;
        this.paymentEventsGateway.emitPaymentStatus({
            status: 'PAYMENT_REQUEST_SENT',
            message: 'Enviando petición a la pasarela de pagos...',
            data: {
                eventTicketId,
                provider,
                amount: totalPrice,
            },
        });
        const paymentResult = await this.sendPaymentToGateway({
            companyId: process.env.PAYMENT_COMPANY_ID ||
                '550e8400-e29b-41d4-a716-446655440000',
            externalRef,
            idempotencyKey,
            provider,
            cardNumber,
            cvv,
            amount: totalPrice,
        });
        this.paymentEventsGateway.emitPaymentStatus({
            status: 'PAYMENT_GATEWAY_RESPONSE_RECEIVED',
            message: 'Respuesta recibida desde la pasarela de pagos.',
            data: paymentResult,
        });
        const paymentWasRejected = paymentResult.payment?.status === 'RECHAZADO' ||
            paymentResult.payment?.providerResponse?.approved === false;
        if (paymentWasRejected) {
            const rejectionReason = paymentResult.payment?.providerResponse?.reason ||
                paymentResult.payment?.providerResponse?.message ||
                paymentResult.message ||
                paymentResult.error ||
                'El pago fue rechazado por la pasarela';
            const technicalCode = paymentResult.payment?.providerResponse?.code || 'PAYMENT_REJECTED';
            await this.paymentEventsService.publish('payment.result.created', {
                eventType: 'PAYMENT_FAILED',
                userId,
                eventTicketId,
                provider,
                technicalCode,
                technicalMessage: rejectionReason,
                eventName: eventTicket.event.name,
                ticketTypeName: eventTicket.ticketType.name,
                amount: totalPrice,
            });
            return {
                message: rejectionReason,
                payment: paymentResult.payment,
                purchase: null,
            };
        }
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
        await this.paymentEventsService.publish('payment.result.created', {
            eventType: 'PAYMENT_SUCCESS',
            purchaseId: purchase.id,
            userId,
            eventTicketId,
            provider,
            eventName: eventTicket.event.name,
            ticketTypeName: eventTicket.ticketType.name,
            quantity,
            amount: totalPrice,
        });
        return {
            message: 'Compra realizada correctamente',
            purchase,
            payment: paymentResult.payment,
        };
    }
    async sendPaymentToGateway(payload) {
        const gatewayUrl = process.env.PAYMENT_GATEWAY_URL || 'http://localhost:3010';
        try {
            const response = await fetch(`${gatewayUrl}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            }
            catch {
                throw new Error(`La pasarela respondió un formato no válido: ${responseText.slice(0, 120)}`);
            }
            const isGatewayBusinessRejection = !response.ok && Boolean(data.paymentId) && Boolean(data.reason);
            if (isGatewayBusinessRejection) {
                return {
                    message: data.message || 'Pago rechazado por el proveedor de tarjeta',
                    payment: {
                        id: data.paymentId,
                        status: 'RECHAZADO',
                        provider: payload.provider,
                        providerResponse: {
                            approved: false,
                            code: 'PAYMENT_REJECTED',
                            reason: data.reason,
                            message: data.message || data.reason,
                        },
                    },
                };
            }
            if (!response.ok) {
                throw new Error(data.message ||
                    data.error ||
                    data.reason ||
                    'La pasarela respondió con error sin detalle de pago');
            }
            return data;
        }
        catch (error) {
            await this.paymentEventsService.publish('payment.result.created', {
                eventType: 'PAYMENT_TIMEOUT',
                provider: payload.provider,
                technicalCode: 'NETWORK_TIMEOUT',
                technicalMessage: error instanceof Error
                    ? error.message
                    : 'No fue posible conectar con la pasarela de pagos',
                amount: payload.amount,
            });
            throw new common_1.BadRequestException('No fue posible conectar correctamente con la pasarela de pagos');
        }
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payment_events_gateway_1.PaymentEventsGateway,
        payment_events_service_1.PaymentEventsService])
], TicketPurchasesService);
//# sourceMappingURL=ticket-purchases.service.js.map