import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaymentEventsGateway } from './payment-events.gateway';
import { PaymentEventsService } from './payment-events.service';
import type { PaymentProcessProgressEvent } from './types/payment-process-progress-event.type';

@Injectable()
export class PaymentProgressConsumerService implements OnModuleInit {
  constructor(
    private readonly paymentEventsService: PaymentEventsService,
    private readonly paymentEventsGateway: PaymentEventsGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.paymentEventsService.consume(
      'payment.process.progress',
      async (payload) => {
        const event = payload as PaymentProcessProgressEvent;

        console.log('Progreso técnico recibido:', event);

        this.paymentEventsGateway.emitPaymentStatus({
          paymentTrackingId: event.paymentTrackingId,
          status: 'PAYMENT_PROCESS_PROGRESS',
          message: event.title,
          data: event,
        });
      },
    );
  }
}