"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var PaymentEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEventsService = void 0;
const common_1 = require("@nestjs/common");
const amqp = __importStar(require("amqplib"));
let PaymentEventsService = PaymentEventsService_1 = class PaymentEventsService {
    logger = new common_1.Logger(PaymentEventsService_1.name);
    connection;
    channel;
    rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    async onModuleInit() {
        await this.connectWithRetry();
    }
    async publish(queue, payload) {
        const channel = await this.getOrCreateChannel();
        await channel.assertQueue(queue, {
            durable: true,
        });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
            persistent: true,
        });
        this.logger.log(`Evento publicado en RabbitMQ: ${queue}`);
    }
    async consume(queue, handler) {
        const channel = await this.getOrCreateChannel();
        await channel.assertQueue(queue, {
            durable: true,
        });
        await channel.consume(queue, async (message) => {
            if (!message)
                return;
            try {
                const payload = JSON.parse(message.content.toString());
                await handler(payload);
                channel.ack(message);
            }
            catch (error) {
                this.logger.error(`Error procesando evento de RabbitMQ: ${queue}`, error);
                channel.nack(message, false, false);
            }
        });
        this.logger.log(`Backend escuchando cola RabbitMQ: ${queue}`);
    }
    async getOrCreateChannel() {
        if (this.channel) {
            return this.channel;
        }
        await this.connectWithRetry();
        if (!this.channel) {
            throw new Error('No fue posible crear el canal de RabbitMQ');
        }
        return this.channel;
    }
    async connectWithRetry(retries = 15, delayMs = 3000) {
        if (this.channel) {
            return;
        }
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                this.logger.log(`Intentando conectar a RabbitMQ. Intento ${attempt}/${retries}`);
                this.connection = await amqp.connect(this.rabbitUrl);
                this.channel = await this.connection.createChannel();
                this.logger.log('API conectado correctamente a RabbitMQ');
                return;
            }
            catch (error) {
                this.logger.warn(`RabbitMQ no disponible. Reintento ${attempt}/${retries} en ${delayMs}ms`);
                if (attempt === retries) {
                    this.logger.error('No fue posible conectar a RabbitMQ', error);
                    throw error;
                }
                await this.sleep(delayMs);
            }
        }
    }
    sleep(delayMs) {
        return new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    async onModuleDestroy() {
        await this.channel?.close();
        await this.connection?.close();
        this.logger.log('Conexión RabbitMQ cerrada');
    }
};
exports.PaymentEventsService = PaymentEventsService;
exports.PaymentEventsService = PaymentEventsService = PaymentEventsService_1 = __decorate([
    (0, common_1.Injectable)()
], PaymentEventsService);
//# sourceMappingURL=payment-events.service.js.map