export type PaymentProcessProgressStep =
  | 'API_PAYMENT_EVENT_PUBLISHED'
  | 'AI_WORKER_PAYMENT_EVENT_CONSUMED'
  | 'AI_WORKER_LLM_STARTED'
  | 'AI_WORKER_LLM_COMPLETED'
  | 'AI_WORKER_AI_EVENT_PUBLISHED'
  | 'API_AI_EVENT_CONSUMED'
  | 'API_SOCKET_EVENT_EMITTED';

export interface PaymentProcessProgressEvent {
  eventId: string;
  paymentTrackingId: string;
  step: PaymentProcessProgressStep;
  title: string;
  description: string;
  component: 'API' | 'RABBITMQ' | 'AI_WORKER' | 'LLM' | 'WEBSOCKET';
  queueName?: string;
  routingKey?: string;
  sourceEventId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}