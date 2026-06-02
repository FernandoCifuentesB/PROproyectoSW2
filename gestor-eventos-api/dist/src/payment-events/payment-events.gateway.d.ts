import { Socket } from 'socket.io';
export type PaymentSocketStatus = 'PAYMENT_REQUEST_SENT' | 'PAYMENT_GATEWAY_RESPONSE_RECEIVED' | 'PAYMENT_AI_ANALYSIS_COMPLETED' | 'PAYMENT_PROCESS_PROGRESS';
export interface PaymentSocketEvent {
    paymentTrackingId: string;
    purchaseId?: string;
    status: PaymentSocketStatus;
    message: string;
    data?: unknown;
}
export declare class PaymentEventsGateway {
    private server;
    joinPaymentRoom(client: Socket, payload: {
        paymentTrackingId: string;
    }): Promise<{
        ok: boolean;
        room?: string;
        message?: string;
    }>;
    leavePaymentRoom(client: Socket, payload: {
        paymentTrackingId: string;
    }): Promise<{
        ok: boolean;
        room?: string;
        message?: string;
    }>;
    emitPaymentStatus(event: PaymentSocketEvent): void;
    private getPaymentRoom;
}
