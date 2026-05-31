import { Module } from '@nestjs/common';
import { PaymentAiConsumerService } from './payment-ai-consumer.service';
import { PaymentEventsGateway } from './payment-events.gateway';
import { PaymentEventsService } from './payment-events.service';
import { PaymentProgressConsumerService } from './payment-progress-consumer.service';

@Module({
  providers: [
    PaymentEventsGateway,
    PaymentEventsService,
    PaymentAiConsumerService,
    PaymentProgressConsumerService
  ],
  exports: [PaymentEventsGateway, PaymentEventsService],
})
export class PaymentEventsModule { }