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
exports.PaymentProgressConsumerService = void 0;
const common_1 = require("@nestjs/common");
const payment_events_gateway_1 = require("./payment-events.gateway");
const payment_events_service_1 = require("./payment-events.service");
let PaymentProgressConsumerService = class PaymentProgressConsumerService {
    paymentEventsService;
    paymentEventsGateway;
    constructor(paymentEventsService, paymentEventsGateway) {
        this.paymentEventsService = paymentEventsService;
        this.paymentEventsGateway = paymentEventsGateway;
    }
    async onModuleInit() {
        await this.paymentEventsService.consume('payment.process.progress', async (payload) => {
            const event = payload;
            console.log('Progreso técnico recibido:', event);
            this.paymentEventsGateway.emitPaymentStatus({
                paymentTrackingId: event.paymentTrackingId,
                status: 'PAYMENT_PROCESS_PROGRESS',
                message: event.title,
                data: event,
            });
        });
    }
};
exports.PaymentProgressConsumerService = PaymentProgressConsumerService;
exports.PaymentProgressConsumerService = PaymentProgressConsumerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payment_events_service_1.PaymentEventsService,
        payment_events_gateway_1.PaymentEventsGateway])
], PaymentProgressConsumerService);
//# sourceMappingURL=payment-progress-consumer.service.js.map