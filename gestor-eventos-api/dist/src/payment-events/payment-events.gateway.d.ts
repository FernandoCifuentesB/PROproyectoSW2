export type PaymentSocketStatus = 'PAYMENT_REQUEST_SENT' | 'PAYMENT_GATEWAY_RESPONSE_RECEIVED' | 'PAYMENT_AI_ANALYSIS_COMPLETED';
export interface PaymentSocketEvent {
    purchaseId?: string;
    status: PaymentSocketStatus;
    message: string;
    data?: unknown;
}
export declare class PaymentEventsGateway {
    private server;
    emitPaymentStatus(event: PaymentSocketEvent): void;
}
