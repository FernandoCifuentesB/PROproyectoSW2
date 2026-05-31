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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMqService = void 0;
const amqp = __importStar(require("amqplib"));
class RabbitMqService {
    rabbitUrl;
    connection;
    channel;
    constructor(rabbitUrl) {
        this.rabbitUrl = rabbitUrl;
    }
    async connect() {
        this.connection = await amqp.connect(this.rabbitUrl);
        this.channel = await this.connection.createChannel();
        console.log("Worker conectado a RabbitMQ");
    }
    async consume(queue, handler) {
        const channel = this.getChannel();
        await channel.assertQueue(queue, {
            durable: true,
        });
        channel.consume(queue, async (message) => {
            if (!message)
                return;
            try {
                const payload = JSON.parse(message.content.toString());
                await handler(payload);
                channel.ack(message);
            }
            catch (error) {
                console.error("Error procesando mensaje:", error);
                channel.nack(message, false, false);
            }
        });
        console.log(`Worker escuchando cola: ${queue}`);
    }
    async publish(queue, payload) {
        const channel = this.getChannel();
        await channel.assertQueue(queue, {
            durable: true,
        });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
            persistent: true,
        });
        console.log(`Evento publicado en cola: ${queue}`);
    }
    getChannel() {
        if (!this.channel) {
            throw new Error("RabbitMQ no está conectado");
        }
        return this.channel;
    }
}
exports.RabbitMqService = RabbitMqService;
