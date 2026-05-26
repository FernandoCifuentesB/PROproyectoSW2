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

type OllamaGenerateResponse = {
  response?: string;
};

export class AiMessageService {
  private readonly ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  private readonly model = process.env.OLLAMA_MODEL || "llama3.2";

  async generateMessage(
    event: PaymentResultEvent,
  ): Promise<PaymentAiCompletedEvent> {
    const status = this.getStatus(event.eventType);

    const userMessage = await this.generateMessageWithOllama(event);

    return {
      eventType: "PAYMENT_AI_COMPLETED",
      originalEventType: event.eventType,
      purchaseId: event.purchaseId,
      userId: event.userId,
      eventTicketId: event.eventTicketId,
      status,
      technicalCode: event.technicalCode,
      userMessage,
    };
  }

  private async generateMessageWithOllama(
    event: PaymentResultEvent,
  ): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          prompt: this.buildPrompt(event),
          stream: false,
          options: {
            temperature: 1.1,
            top_p: 0.95,
            repeat_penalty: 1.15,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama respondió con estado ${response.status}`);
      }

      const data = (await response.json()) as OllamaGenerateResponse;
      const message = data.response?.trim();

      if (!message) {
        return this.generateFallbackMessage(event);
      }

      return this.cleanMessage(message);
    } catch (error) {
      console.error("Error generando mensaje con Ollama:", error);
      return this.generateFallbackMessage(event);
    }
  }

  private buildPrompt(event: PaymentResultEvent): string {
    const eventName = event.eventName || "el evento";
    const ticketTypeName = event.ticketTypeName || "la entrada";
    const quantity = event.quantity || 1;
    const amount = event.amount || "el valor de la compra";
    const provider = event.provider || "la pasarela";

    const randomSeed = `${Date.now()}-${Math.random()}`;

    if (event.eventType === "PAYMENT_SUCCESS") {
      return `
Eres un agente inteligente de una plataforma de eventos.

Genera UN mensaje nuevo, natural y diferente para confirmar una compra exitosa.

Datos:
- Evento: ${eventName}
- Tipo de entrada: ${ticketTypeName}
- Cantidad: ${quantity}
- Valor: ${amount}
- Medio de pago: ${provider}
- Semilla de variación: ${randomSeed}

Reglas:
- Responde en español.
- Máximo 2 frases.
- No repitas estructuras exactas.
- No uses comillas.
- No uses listas.
- No menciones que eres una IA.
- Debe sonar humano, positivo y útil.
- Incluye una recomendación breve para asistir al evento.
`;
    }

    if (event.eventType === "PAYMENT_TIMEOUT") {
      return `
Eres un agente inteligente de recuperación de ventas para una plataforma de eventos.

Genera UN mensaje nuevo, empático y persuasivo para un error técnico o timeout en el pago.

Datos:
- Evento: ${eventName}
- Tipo de entrada: ${ticketTypeName}
- Medio de pago: ${provider}
- Código técnico interno: ${event.technicalCode || "NETWORK_TIMEOUT"}
- Detalle técnico interno: ${event.technicalMessage || "error temporal de conexión"}
- Semilla de variación: ${randomSeed}

Reglas:
- Responde en español.
- Máximo 2 frases.
- No uses lenguaje técnico.
- No uses comillas.
- No uses listas.
- No menciones que eres una IA.
- Debe tranquilizar al usuario.
- Invita a intentar nuevamente sin sonar robótico.
`;
    }

    return `
Eres un agente inteligente de recuperación de pagos para una plataforma de eventos.

Genera UN mensaje nuevo, empático y persuasivo para un pago rechazado.

Datos:
- Evento: ${eventName}
- Tipo de entrada: ${ticketTypeName}
- Valor: ${amount}
- Medio de pago: ${provider}
- Código técnico interno: ${event.technicalCode || "PAYMENT_REJECTED"}
- Detalle técnico interno: ${event.technicalMessage || "pago rechazado"}
- Semilla de variación: ${randomSeed}

Reglas:
- Responde en español.
- Máximo 2 frases.
- No uses lenguaje técnico.
- No uses comillas.
- No uses listas.
- No menciones que eres una IA.
- Debe sonar empático.
- Debe motivar al usuario a intentar de nuevo o usar otro medio de pago.
`;
  }

  private getStatus(
    eventType: PaymentEventType,
  ): "SUCCESS" | "FAILED" | "TIMEOUT" {
    if (eventType === "PAYMENT_SUCCESS") return "SUCCESS";
    if (eventType === "PAYMENT_TIMEOUT") return "TIMEOUT";
    return "FAILED";
  }

  private cleanMessage(message: string): string {
    return message
      .replace(/^["'“”]+/, "")
      .replace(/["'“”]+$/, "")
      .replace(/\n/g, " ")
      .trim();
  }

  private generateFallbackMessage(event: PaymentResultEvent): string {
    const eventName = event.eventName || "tu evento";
    const ticketTypeName = event.ticketTypeName || "entrada";
    const uniqueReference = Math.floor(Math.random() * 99999);

    if (event.eventType === "PAYMENT_SUCCESS") {
      return `Tu compra fue confirmada correctamente para ${eventName}. Ten lista tu ${ticketTypeName} y llega con tiempo para disfrutar la experiencia. Ref ${uniqueReference}`;
    }

    if (event.eventType === "PAYMENT_TIMEOUT") {
      return `Tuvimos una interrupción temporal al procesar el pago. Intenta nuevamente en unos minutos para completar tu compra. Ref ${uniqueReference}`;
    }

    return `No pudimos completar el pago en este intento. Revisa los datos o prueba con otro medio de pago para asegurar tu entrada. Ref ${uniqueReference}`;
  }
}