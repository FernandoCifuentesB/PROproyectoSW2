import {
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

export type PaymentSocketStatus =
    | 'PAYMENT_REQUEST_SENT'
    | 'PAYMENT_GATEWAY_RESPONSE_RECEIVED'
    | 'PAYMENT_AI_ANALYSIS_COMPLETED';

export interface PaymentSocketEvent {
    purchaseId?: string;
    status: PaymentSocketStatus;
    message: string;
    data?: unknown;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class PaymentEventsGateway {
    @WebSocketServer()
    private server!: Server;

    emitPaymentStatus(event: PaymentSocketEvent): void {
        this.server.emit('payment-status', event);
    }
}