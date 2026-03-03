import { PrismaService } from "../prisma/prisma.service";
import { ToggleInterestDto } from "./dto";
export declare class InterestsService {
    private prisma;
    constructor(prisma: PrismaService);
    toggle(dto: ToggleInterestDto): Promise<{
        interested: boolean;
        interestCount: any;
    }>;
    reportTop(): Promise<any>;
}
