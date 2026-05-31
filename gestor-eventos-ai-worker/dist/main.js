"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const ai_message_service_1 = require("./ai-message.service");
const rabbitmq_service_1 = require("./rabbitmq.service");
dotenv_1.default.config();
const PAYMENT_RESULT_QUEUE = "payment.result.created";
const PAYMENT_AI_COMPLETED_QUEUE = "payment.ai.completed";
async function bootstrap() {
    const rabbitUrl = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
    const rabbitMqService = new rabbitmq_service_1.RabbitMqService(rabbitUrl);
    const aiMessageService = new ai_message_service_1.AiMessageService();
    await rabbitMqService.connect();
    await rabbitMqService.consume(PAYMENT_RESULT_QUEUE, async (payload) => {
        const paymentEvent = payload;
        console.log("Evento de pago recibido:", paymentEvent);
        const aiCompletedEvent = await aiMessageService.generateMessage(paymentEvent);
        await rabbitMqService.publish(PAYMENT_AI_COMPLETED_QUEUE, aiCompletedEvent);
        console.log("Evento AI generado:", aiCompletedEvent);
    });
}
bootstrap().catch((error) => {
    console.error("Error iniciando worker AI:", error);
    process.exit(1);
});
