import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { AiMessageService, PaymentResultEvent } from "./ai-message.service";
import { RabbitMqService } from "./rabbitmq.service";

dotenv.config();

const PAYMENT_RESULT_QUEUE = "payment.result.created";
const PAYMENT_AI_COMPLETED_QUEUE = "payment.ai.completed";
const PAYMENT_PROCESS_PROGRESS_QUEUE = "payment.process.progress";

type PaymentProcessProgressEvent = {
  eventId: string;
  paymentTrackingId: string;
  step:
    | "AI_WORKER_PAYMENT_EVENT_CONSUMED"
    | "AI_WORKER_LLM_STARTED"
    | "AI_WORKER_LLM_COMPLETED"
    | "AI_WORKER_AI_EVENT_PUBLISHED"
    | "AI_WORKER_ERROR";
  title: string;
  description: string;
  component: "AI_WORKER" | "LLM" | "RABBITMQ";
  queueName?: string;
  sourceEventId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

async function publishProgress(
  rabbitMqService: RabbitMqService,
  progressEvent: PaymentProcessProgressEvent,
): Promise<void> {
  await rabbitMqService.publish(PAYMENT_PROCESS_PROGRESS_QUEUE, progressEvent);

  console.log("Progreso técnico publicado:", progressEvent);
}

async function bootstrap() {
  const rabbitUrl =
    process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

  const rabbitMqService = new RabbitMqService(rabbitUrl);
  const aiMessageService = new AiMessageService();

  await rabbitMqService.connect();

  await rabbitMqService.consume(PAYMENT_RESULT_QUEUE, async (payload) => {
    const paymentEvent = payload as PaymentResultEvent;

    console.log("Evento de pago recibido:", paymentEvent);

    try {
      await publishProgress(rabbitMqService, {
        eventId: randomUUID(),
        paymentTrackingId: paymentEvent.paymentTrackingId,
        step: "AI_WORKER_PAYMENT_EVENT_CONSUMED",
        title: "Worker AI consumió evento de pago",
        description:
          "El Worker AI recibió el evento desde la cola payment.result.created para iniciar el análisis.",
        component: "AI_WORKER",
        queueName: PAYMENT_RESULT_QUEUE,
        sourceEventId: paymentEvent.eventId,
        createdAt: new Date().toISOString(),
        metadata: {
          eventType: paymentEvent.eventType,
          provider: paymentEvent.provider,
          technicalCode: paymentEvent.technicalCode,
        },
      });

      await publishProgress(rabbitMqService, {
        eventId: randomUUID(),
        paymentTrackingId: paymentEvent.paymentTrackingId,
        step: "AI_WORKER_LLM_STARTED",
        title: "Worker AI inició análisis con LLM",
        description:
          "El Worker AI envió la información técnica del pago al modelo de lenguaje para generar una respuesta personalizada.",
        component: "LLM",
        sourceEventId: paymentEvent.eventId,
        createdAt: new Date().toISOString(),
        metadata: {
          eventType: paymentEvent.eventType,
          technicalMessage: paymentEvent.technicalMessage,
          eventName: paymentEvent.eventName,
          ticketTypeName: paymentEvent.ticketTypeName,
        },
      });

      const aiCompletedEvent =
        await aiMessageService.generateMessage(paymentEvent);

      await publishProgress(rabbitMqService, {
        eventId: randomUUID(),
        paymentTrackingId: paymentEvent.paymentTrackingId,
        step: "AI_WORKER_LLM_COMPLETED",
        title: "LLM generó respuesta personalizada",
        description:
          "El modelo generó un mensaje empático o de confirmación según el resultado del pago.",
        component: "LLM",
        sourceEventId: paymentEvent.eventId,
        createdAt: new Date().toISOString(),
        metadata: {
          generatedStatus: aiCompletedEvent.status,
          technicalCode: aiCompletedEvent.technicalCode,
        },
      });

      await rabbitMqService.publish(
        PAYMENT_AI_COMPLETED_QUEUE,
        aiCompletedEvent,
      );

      await publishProgress(rabbitMqService, {
        eventId: randomUUID(),
        paymentTrackingId: paymentEvent.paymentTrackingId,
        step: "AI_WORKER_AI_EVENT_PUBLISHED",
        title: "Worker AI publicó resultado en RabbitMQ",
        description:
          "El Worker AI publicó el evento payment.ai.completed para que el API lo consuma y lo envíe al usuario por WebSocket.",
        component: "RABBITMQ",
        queueName: PAYMENT_AI_COMPLETED_QUEUE,
        sourceEventId: aiCompletedEvent.eventId,
        createdAt: new Date().toISOString(),
        metadata: {
          originalEventType: aiCompletedEvent.originalEventType,
          status: aiCompletedEvent.status,
        },
      });

      console.log("Evento AI generado:", aiCompletedEvent);
    } catch (error) {
      console.error("Error procesando mensaje:", error);

      if (paymentEvent.paymentTrackingId) {
        await publishProgress(rabbitMqService, {
          eventId: randomUUID(),
          paymentTrackingId: paymentEvent.paymentTrackingId,
          step: "AI_WORKER_ERROR",
          title: "Error en Worker AI",
          description:
            "El Worker AI presentó un error procesando el evento recibido desde RabbitMQ.",
          component: "AI_WORKER",
          queueName: PAYMENT_RESULT_QUEUE,
          sourceEventId: paymentEvent.eventId,
          createdAt: new Date().toISOString(),
          metadata: {
            errorMessage:
              error instanceof Error
                ? error.message
                : "Error desconocido en Worker AI",
          },
        });
      }
    }
  });
}

bootstrap().catch((error) => {
  console.error("Error iniciando worker AI:", error);
  process.exit(1);
});