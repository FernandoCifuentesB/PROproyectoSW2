import dotenv from "dotenv";
import { AiMessageService, PaymentResultEvent } from "./ai-message.service";
import { RabbitMqService } from "./rabbitmq.service";

dotenv.config();

const PAYMENT_RESULT_QUEUE = "payment.result.created";
const PAYMENT_AI_COMPLETED_QUEUE = "payment.ai.completed";

async function bootstrap() {
  const rabbitUrl =
    process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

  const rabbitMqService = new RabbitMqService(rabbitUrl);
  const aiMessageService = new AiMessageService();

  await rabbitMqService.connect();

 await rabbitMqService.consume(PAYMENT_RESULT_QUEUE, async (payload) => {
  const paymentEvent = payload as PaymentResultEvent;

  console.log("Evento de pago recibido:", paymentEvent);

  const aiCompletedEvent = await aiMessageService.generateMessage(paymentEvent);

  await rabbitMqService.publish(
    PAYMENT_AI_COMPLETED_QUEUE,
    aiCompletedEvent,
  );

  console.log("Evento AI generado:", aiCompletedEvent);
});
}

bootstrap().catch((error) => {
  console.error("Error iniciando worker AI:", error);
  process.exit(1);
});