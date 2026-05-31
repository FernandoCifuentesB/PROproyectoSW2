import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PaymentEventsGateway } from './payment-events.gateway';
import { PaymentEventsService } from './payment-events.service';

type PaymentAiCompletedEvent = {
  paymentTrackingId: string;
  purchaseId?: string;
  message: string;
  eventType?: string;
  provider?: string;
  technicalCode?: string;
  technicalMessage?: string;
  [key: string]: unknown;
};

@Injectable()
export class PaymentAiConsumerService implements OnModuleInit {
  private readonly logger = new Logger(PaymentAiConsumerService.name);

  constructor(
    private readonly paymentEventsService: PaymentEventsService,
    private readonly paymentEventsGateway: PaymentEventsGateway,
  ) { }

  async onModuleInit(): Promise<void> {
    await this.paymentEventsService.consume(
      'payment.ai.completed',
      async (payload) => {
        const event = payload as PaymentAiCompletedEvent;

        if (!event.paymentTrackingId) {
          this.logger.warn(
            'Evento payment.ai.completed recibido sin paymentTrackingId',
          );
          return;
        }

        this.paymentEventsGateway.emitPaymentStatus({
          paymentTrackingId: event.paymentTrackingId,
          purchaseId: event.purchaseId,
          status: 'PAYMENT_AI_ANALYSIS_COMPLETED',
          message: event.message,
          data: event,
        });

        this.logger.log(
          `Resultado AI enviado por WebSocket: ${event.paymentTrackingId}`,
        );
      },
    );
  }
}