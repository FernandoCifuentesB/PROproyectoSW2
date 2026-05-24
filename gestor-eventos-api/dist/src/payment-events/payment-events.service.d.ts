import { OnModuleDestroy } from '@nestjs/common';
export declare class PaymentEventsService implements OnModuleDestroy {
    private readonly logger;
    private connection?;
    private channel?;
    private readonly rabbitUrl;
    publish(queue: string, payload: unknown): Promise<void>;
    consume(queue: string, handler: (payload: unknown) => Promise<void>): Promise<void>;
    private getOrCreateChannel;
    onModuleDestroy(): Promise<void>;
}
