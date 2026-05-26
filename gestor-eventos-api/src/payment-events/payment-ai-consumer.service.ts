import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PaymentEventsGateway } from './payment-events.gateway';
import { PaymentEventsService } from './payment-events.service';

type PaymentAiCompletedEvent = {
  eventType: 'PAYMENT_AI_COMPLETED';
  originalEventType: 'PAYMENT_FAILED' | 'PAYMENT_TIMEOUT' | 'PAYMENT_SUCCESS';
  purchaseId?: string;
  userId?: string;
  eventTicketId?: string;
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  userMessage: string;
  technicalCode?: string;
};

@Injectable()
export class PaymentAiConsumerService implements OnModuleInit {
  private readonly logger = new Logger(PaymentAiConsumerService.name);

  constructor(
    private readonly paymentEventsService: PaymentEventsService,
    private readonly paymentEventsGateway: PaymentEventsGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.paymentEventsService.consume(
      'payment.ai.completed',
      async (payload) => {
        const event = payload as PaymentAiCompletedEvent;

        this.logger.log(
          `Evento AI recibido para WebSocket: ${event.status}`,
        );

        this.paymentEventsGateway.emitPaymentStatus({
          purchaseId: event.purchaseId,
          status: 'PAYMENT_AI_ANALYSIS_COMPLETED',
          message: event.userMessage,
          data: event,
        });
      },
    );
  }
}