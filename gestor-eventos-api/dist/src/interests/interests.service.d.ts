import { PrismaService } from "../prisma/prisma.service";
export declare class InterestsService {
    private prisma;
    constructor(prisma: PrismaService);
    toggle(userId: string, eventId: string): Promise<{
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
