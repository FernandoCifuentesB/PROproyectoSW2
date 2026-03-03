import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto, UpdateEventDto } from "./dto";
type PublicQuery = {
    page: number;
    pageSize: number;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    fromDate?: string;
    toDate?: string;
};
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    listPublic(q: PublicQuery): Promise<{
        page: number;
        pageSize: number;
        total: any;
        items: any;
    }>;
    listAdmin(): Promise<any>;
    get(id: string): Promise<any>;
    create(dto: CreateEventDto): Promise<any>;
    update(id: string, dto: UpdateEventDto): Promise<any>;
    remove(id: string): Promise<any>;
}
export {};
