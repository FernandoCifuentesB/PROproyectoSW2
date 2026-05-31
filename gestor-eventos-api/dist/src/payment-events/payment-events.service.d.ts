import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export declare class PaymentEventsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private connection?;
    private channel?;
    private readonly rabbitUrl;
    onModuleInit(): Promise<void>;
    publish(queue: string, payload: unknown): Promise<void>;
    consume(queue: string, handler: (payload: unknown) => Promise<void>): Promise<void>;
    private getOrCreateChannel;
    private connectWithRetry;
    private sleep;
    onModuleDestroy(): Promise<void>;
}
