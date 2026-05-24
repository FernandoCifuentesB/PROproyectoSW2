import { OnModuleDestroy } from '@nestjs/common';
export declare class PaymentEventsService implements OnModuleDestroy {
    private readonly logger;
    private connection;
    private channel;
    private readonly rabbitUrl;
    publish(queue: string, payload: unknown): Promise<void>;
    private connect;
    onModuleDestroy(): Promise<void>;
}
