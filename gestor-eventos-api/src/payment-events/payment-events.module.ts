import { Module } from '@nestjs/common';
import { PaymentEventsGateway } from './payment-events.gateway';
import { PaymentEventsService } from './payment-events.service';

@Module({
  providers: [PaymentEventsGateway, PaymentEventsService],
  exports: [PaymentEventsGateway, PaymentEventsService],
})
export class PaymentEventsModule {}