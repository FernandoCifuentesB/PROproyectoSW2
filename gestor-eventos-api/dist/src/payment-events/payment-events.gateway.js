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
exports.PaymentEventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let PaymentEventsGateway = class PaymentEventsGateway {
    server;
    async joinPaymentRoom(client, payload) {
        if (!payload?.paymentTrackingId) {
            return {
                ok: false,
                message: 'paymentTrackingId es obligatorio',
            };
        }
        const room = this.getPaymentRoom(payload.paymentTrackingId);
        await client.join(room);
        return {
            ok: true,
            room,
            message: 'Cliente unido a la sala del pago',
        };
    }
    async leavePaymentRoom(client, payload) {
        if (!payload?.paymentTrackingId) {
            return {
                ok: false,
                message: 'paymentTrackingId es obligatorio',
            };
        }
        const room = this.getPaymentRoom(payload.paymentTrackingId);
        await client.leave(room);
        return {
            ok: true,
            room,
            message: 'Cliente salió de la sala del pago',
        };
    }
    emitPaymentStatus(event) {
        const room = this.getPaymentRoom(event.paymentTrackingId);
        this.server.to(room).emit('payment-status', event);
    }
    getPaymentRoom(paymentTrackingId) {
        return `payment:${paymentTrackingId}`;
    }
};
exports.PaymentEventsGateway = PaymentEventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PaymentEventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-payment-room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], PaymentEventsGateway.prototype, "joinPaymentRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-payment-room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], PaymentEventsGateway.prototype, "leavePaymentRoom", null);
exports.PaymentEventsGateway = PaymentEventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], PaymentEventsGateway);
//# sourceMappingURL=payment-events.gateway.js.map