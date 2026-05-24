import * as amqp from "amqplib";
import type { Channel, ConsumeMessage } from "amqplib";

export class RabbitMqService {
  private connection?: Awaited<ReturnType<typeof amqp.connect>>;
  private channel?: Channel;

  constructor(private readonly rabbitUrl: string) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.rabbitUrl);
    this.channel = await this.connection.createChannel();

    console.log("Worker conectado a RabbitMQ");
  }

  async consume(
    queue: string,
    handler: (payload: unknown) => Promise<void>,
  ): Promise<void> {
    const channel = this.getChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    channel.consume(queue, async (message: ConsumeMessage | null) => {
      if (!message) return;

      try {
        const payload = JSON.parse(message.content.toString()) as unknown;

        await handler(payload);

        channel.ack(message);
      } catch (error) {
        console.error("Error procesando mensaje:", error);

        channel.nack(message, false, false);
      }
    });

    console.log(`Worker escuchando cola: ${queue}`);
  }

  async publish(queue: string, payload: unknown): Promise<void> {
    const channel = this.getChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });

    console.log(`Evento publicado en cola: ${queue}`);
  }

  private getChannel(): Channel {
    if (!this.channel) {
      throw new Error("RabbitMQ no está conectado");
    }

    return this.channel;
  }
}