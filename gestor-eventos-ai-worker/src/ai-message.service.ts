export type PaymentEventType =
  | "PAYMENT_FAILED"
  | "PAYMENT_TIMEOUT"
  | "PAYMENT_SUCCESS";

export type PaymentResultEvent = {
  eventType: PaymentEventType;
  purchaseId?: string;
  userId?: string;
  eventTicketId?: string;
  provider?: "VISA" | "MASTERCARD" | "NU";
  technicalCode?: string;
  technicalMessage?: string;
  eventName?: string;
  ticketTypeName?: string;
  quantity?: number;
  amount?: number;
};

export type PaymentAiCompletedEvent = {
  eventType: "PAYMENT_AI_COMPLETED";
  originalEventType: PaymentEventType;
  purchaseId?: string;
  userId?: string;
  eventTicketId?: string;
  status: "SUCCESS" | "FAILED" | "TIMEOUT";
  userMessage: string;
  technicalCode?: string;
};

export class AiMessageService {
  generateMessage(event: PaymentResultEvent): PaymentAiCompletedEvent {
    if (event.eventType === "PAYMENT_SUCCESS") {
      return this.generateSuccessMessage(event);
    }

    if (event.eventType === "PAYMENT_TIMEOUT") {
      return this.generateTimeoutMessage(event);
    }

    return this.generateFailedMessage(event);
  }

  private generateSuccessMessage(
    event: PaymentResultEvent,
  ): PaymentAiCompletedEvent {
    const eventName = event.eventName || "tu evento";
    const ticketTypeName = event.ticketTypeName || "entrada";

    return {
      eventType: "PAYMENT_AI_COMPLETED",
      originalEventType: event.eventType,
      purchaseId: event.purchaseId,
      userId: event.userId,
      eventTicketId: event.eventTicketId,
      status: "SUCCESS",
      userMessage: `¡Compra confirmada! Ya tienes tu ${ticketTypeName} para ${eventName}. Te recomendamos llegar con tiempo, tener tu documento a la mano y revisar las indicaciones del evento antes del ingreso.`,
    };
  }

  private generateTimeoutMessage(
    event: PaymentResultEvent,
  ): PaymentAiCompletedEvent {
    return {
      eventType: "PAYMENT_AI_COMPLETED",
      originalEventType: event.eventType,
      purchaseId: event.purchaseId,
      userId: event.userId,
      eventTicketId: event.eventTicketId,
      status: "TIMEOUT",
      technicalCode: event.technicalCode,
      userMessage:
        "Detectamos un problema técnico al procesar tu pago. No te preocupes, tu lugar puede seguir disponible por unos minutos. Intenta nuevamente o usa otro medio de pago para completar la compra.",
    };
  }

  private generateFailedMessage(
    event: PaymentResultEvent,
  ): PaymentAiCompletedEvent {
    const code = event.technicalCode || "PAYMENT_REJECTED";

    const messageByCode: Record<string, string> = {
      INSUFFICIENT_FUNDS:
        "No pudimos completar el pago porque parece que el saldo o cupo disponible no fue suficiente. Puedes intentar con otra tarjeta o revisar tu banco para no perder tu entrada.",
      INVALID_CVV:
        "El código de seguridad no coincide con la tarjeta. Revisa el CVV e intenta nuevamente; estás muy cerca de completar tu compra.",
      INVALID_CARD:
        "La tarjeta ingresada no pudo ser validada. Verifica el número o intenta con otro medio de pago para finalizar tu compra.",
      PAYMENT_REJECTED:
        "La pasarela rechazó el pago. Puedes intentar nuevamente o usar otra tarjeta para completar tu compra.",
    };

    return {
      eventType: "PAYMENT_AI_COMPLETED",
      originalEventType: event.eventType,
      purchaseId: event.purchaseId,
      userId: event.userId,
      eventTicketId: event.eventTicketId,
      status: "FAILED",
      technicalCode: code,
      userMessage:
        messageByCode[code] ||
        `No pudimos completar el pago por este motivo: ${event.technicalMessage || code}. Puedes intentar nuevamente con otro medio de pago.`,
    };
  }
}