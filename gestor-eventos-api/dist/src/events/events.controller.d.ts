import { EventsService } from "./events.service";
import { CreateEventDto, UpdateEventDto } from "./dto";
export declare class EventsController {
    private service;
    constructor(service: EventsService);
    listPublic(page: number, pageSize: number, search?: string, categoryId?: string, minPrice?: string, maxPrice?: string, fromDate?: string, toDate?: string): Promise<{
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
