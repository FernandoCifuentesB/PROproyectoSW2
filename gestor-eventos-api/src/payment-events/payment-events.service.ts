import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import type { Channel, ConsumeMessage } from 'amqplib';

@Injectable()
export class PaymentEventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentEventsService.name);

  private connection?: Awaited<ReturnType<typeof amqp.connect>>;
  private channel?: Channel;

  private readonly rabbitUrl =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

  async onModuleInit(): Promise<void> {
    await this.connectWithRetry();
  }

  async publish(queue: string, payload: unknown): Promise<void> {
    const channel = await this.getOrCreateChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });

    this.logger.log(`Evento publicado en RabbitMQ: ${queue}`);
  }

  async consume(
    queue: string,
    handler: (payload: unknown) => Promise<void>,
  ): Promise<void> {
    const channel = await this.getOrCreateChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.consume(queue, async (message: ConsumeMessage | null) => {
      if (!message) return;

      try {
        const payload = JSON.parse(message.content.toString()) as unknown;

        await handler(payload);

        channel.ack(message);
      } catch (error) {
        this.logger.error(
          `Error procesando evento de RabbitMQ: ${queue}`,
          error,
        );

        channel.nack(message, false, false);
      }
    });

    this.logger.log(`Backend escuchando cola RabbitMQ: ${queue}`);
  }

  private async getOrCreateChannel(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    await this.connectWithRetry();

    if (!this.channel) {
      throw new Error('No fue posible crear el canal de RabbitMQ');
    }

    return this.channel;
  }

  private async connectWithRetry(
    retries = 15,
    delayMs = 3000,
  ): Promise<void> {
    if (this.channel) {
      return;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.log(
          `Intentando conectar a RabbitMQ. Intento ${attempt}/${retries}`,
        );

        this.connection = await amqp.connect(this.rabbitUrl);
        this.channel = await this.connection.createChannel();

        this.logger.log('API conectado correctamente a RabbitMQ');
        return;
      } catch (error) {
        this.logger.warn(
          `RabbitMQ no disponible. Reintento ${attempt}/${retries} en ${delayMs}ms`,
        );

        if (attempt === retries) {
          this.logger.error('No fue posible conectar a RabbitMQ', error);
          throw error;
        }

        await this.sleep(delayMs);
      }
    }
  }

  private sleep(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();

    this.logger.log('Conexión RabbitMQ cerrada');
  }
}