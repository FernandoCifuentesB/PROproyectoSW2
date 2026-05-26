import { OnModuleInit } from '@nestjs/common';
import { PaymentEventsGateway } from './payment-events.gateway';
import { PaymentEventsService } from './payment-events.service';
export declare class PaymentAiConsumerService implements OnModuleInit {
    private readonly paymentEventsService;
    private readonly paymentEventsGateway;
    private readonly logger;
    constructor(paymentEventsService: PaymentEventsService, paymentEventsGateway: PaymentEventsGateway);
    onModuleInit(): Promise<void>;
}
