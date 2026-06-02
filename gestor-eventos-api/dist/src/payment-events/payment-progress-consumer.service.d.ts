import { OnModuleInit } from '@nestjs/common';
import { PaymentEventsGateway } from './payment-events.gateway';
import { PaymentEventsService } from './payment-events.service';
export declare class PaymentProgressConsumerService implements OnModuleInit {
    private readonly paymentEventsService;
    private readonly paymentEventsGateway;
    constructor(paymentEventsService: PaymentEventsService, paymentEventsGateway: PaymentEventsGateway);
    onModuleInit(): Promise<void>;
}
