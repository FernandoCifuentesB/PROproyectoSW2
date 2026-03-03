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
        total: number;
        items: {
            interestCount: number;
            category: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
            _count: {
                interests: number;
            };
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            date: Date;
            price: number;
            imageUrl: string | null;
            categoryId: string;
        }[];
    }>;
    listAdmin(): Promise<{
        interestCount: number;
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        _count: {
            interests: number;
        };
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        categoryId: string;
    }[]>;
    get(id: string): Promise<{
        interestCount: number;
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        _count: {
            interests: number;
        };
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        categoryId: string;
    }>;
    create(dto: CreateEventDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        categoryId: string;
    }>;
    update(id: string, dto: UpdateEventDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        categoryId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        categoryId: string;
    }>;
}
export {};
