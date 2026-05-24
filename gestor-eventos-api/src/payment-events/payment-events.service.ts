import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class PaymentEventsService implements OnModuleDestroy {
  private readonly logger = new Logger(PaymentEventsService.name);

  private connection!: amqp.ChannelModel;
  private channel!: amqp.Channel;

  private readonly rabbitUrl =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

  async publish(queue: string, payload: unknown): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel.assertQueue(queue, {
      durable: true,
    });

    this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(payload)),
      {
        persistent: true,
      },
    );
  }

  private async connect(): Promise<void> {
    this.connection = await amqp.connect(this.rabbitUrl);
    this.channel = await this.connection.createChannel();

    this.logger.log('RabbitMQ conectado correctamente');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }

    if (this.connection) {
      await this.connection.close();
    }
  }
}