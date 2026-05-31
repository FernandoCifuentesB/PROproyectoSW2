import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export type PaymentSocketStatus =
  | 'PAYMENT_REQUEST_SENT'
  | 'PAYMENT_GATEWAY_RESPONSE_RECEIVED'
  | 'PAYMENT_AI_ANALYSIS_COMPLETED';

export interface PaymentSocketEvent {
  paymentTrackingId: string;
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

  @SubscribeMessage('join-payment-room')
  async joinPaymentRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { paymentTrackingId: string },
  ): Promise<{ ok: boolean; room?: string; message?: string }> {
    if (!payload?.paymentTrackingId) {
      return {
        ok: false,
        message: 'paymentTrackingId es obligatorio',
      };
    }

    const room = this.getPaymentRoom(payload.paymentTrackingId);

    await client.join(room);

    return {
      ok: true,
      room,
      message: 'Cliente unido a la sala del pago',
    };
  }

  @SubscribeMessage('leave-payment-room')
  async leavePaymentRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { paymentTrackingId: string },
  ): Promise<{ ok: boolean; room?: string; message?: string }> {
    if (!payload?.paymentTrackingId) {
      return {
        ok: false,
        message: 'paymentTrackingId es obligatorio',
      };
    }

    const room = this.getPaymentRoom(payload.paymentTrackingId);

    await client.leave(room);

    return {
      ok: true,
      room,
      message: 'Cliente salió de la sala del pago',
    };
  }

  emitPaymentStatus(event: PaymentSocketEvent): void {
    const room = this.getPaymentRoom(event.paymentTrackingId);

    this.server.to(room).emit('payment-status', event);
  }

  private getPaymentRoom(paymentTrackingId: string): string {
    return `payment:${paymentTrackingId}`;
  }
}