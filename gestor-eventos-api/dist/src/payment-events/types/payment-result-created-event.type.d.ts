export type PaymentResultEventType = 'PAYMENT_FAILED' | 'PAYMENT_TIMEOUT' | 'PAYMENT_SUCCESS';
export type PaymentProvider = 'VISA' | 'MASTERCARD' | 'NU';
export interface PaymentResultCreatedEvent {
    eventId: string;
    eventType: PaymentResultEventType;
    paymentTrackingId: string;
    purchaseId?: string;
    userId: string;
    eventTicketId: string;
    provider: PaymentProvider;
    technicalCode: string;
    technicalMessage: string;
    eventName: string;
    ticketTypeName: string;
    quantity: number;
    amount: number;
    currency: 'COP';
    createdAt: string;
}
