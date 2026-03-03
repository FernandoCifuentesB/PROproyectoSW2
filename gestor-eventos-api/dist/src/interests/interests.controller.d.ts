import { InterestsService } from "./interests.service";
export declare class InterestsController {
    private readonly service;
    constructor(service: InterestsService);
    toggle(req: any, body: {
        eventId: string;
    }): Promise<{
        interested: boolean;
        interestCount: number;
    }>;
    reportTop(): Promise<{
        eventId: string;
        name: string;
        category: string;
        interestCount: number;
        date: Date;
        price: number;
    }[]>;
}
