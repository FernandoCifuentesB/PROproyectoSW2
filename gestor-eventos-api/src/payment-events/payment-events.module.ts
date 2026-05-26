import { Module } from '@nestjs/common';
import { PaymentAiConsumerService } from './payment-ai-consumer.service';
import { PaymentEventsGateway } from './payment-events.gateway';
import { PaymentEventsService } from './payment-events.service';

@Module({
  providers: [
    PaymentEventsGateway,
    PaymentEventsService,
    PaymentAiConsumerService,
  ],
  exports: [PaymentEventsGateway, PaymentEventsService],
})
export class PaymentEventsModule {}