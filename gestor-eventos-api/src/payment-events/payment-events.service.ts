import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import type { Channel, ConsumeMessage } from 'amqplib';

@Injectable()
export class PaymentEventsService implements OnModuleDestroy {
  private readonly logger = new Logger(PaymentEventsService.name);

  private connection?: Awaited<ReturnType<typeof amqp.connect>>;
  private channel?: Channel;

  private readonly rabbitUrl =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

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
        this.logger.error(`Error procesando evento de RabbitMQ: ${queue}`, error);

        channel.nack(message, false, false);
      }
    });

    this.logger.log(`Backend escuchando cola RabbitMQ: ${queue}`);
  }

  private async getOrCreateChannel(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    this.connection = await amqp.connect(this.rabbitUrl);
    this.channel = await this.connection.createChannel();

    this.logger.log('RabbitMQ conectado correctamente desde backend');

    return this.channel;
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}