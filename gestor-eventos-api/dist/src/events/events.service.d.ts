import type { Cache } from "cache-manager";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto, UpdateEventDto } from "./dto";
type UploadedImage = {
    filename: string;
};
export declare class EventsService {
    private readonly prisma;
    private readonly cacheManager;
    private readonly topSoldCacheKey;
    constructor(prisma: PrismaService, cacheManager: Cache);
    getTopSoldPublicEvents(): Promise<any[]>;
    clearTopSoldCache(): Promise<void>;
    listPublic(query: any): Promise<{
        page: any;
        pageSize: any;
        total: number;
        items: {
            interestCount: number;
            eventTickets: ({
                ticketType: {
                    id: string;
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                eventId: string;
                ticketTypeId: string;
                stock: number;
                sold: number;
            })[];
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
        eventTickets: ({
            ticketType: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            eventId: string;
            ticketTypeId: string;
            stock: number;
            sold: number;
        })[];
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
        eventTickets: ({
            ticketType: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            eventId: string;
            ticketTypeId: string;
            stock: number;
            sold: number;
        })[];
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
    create(dto: CreateEventDto, image?: UploadedImage): Promise<{
        interestCount: number;
        eventTickets: ({
            ticketType: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            eventId: string;
            ticketTypeId: string;
            stock: number;
            sold: number;
        })[];
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
    update(id: string, dto: UpdateEventDto, image?: UploadedImage): Promise<{
        interestCount: number;
        eventTickets: ({
            ticketType: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            eventId: string;
            ticketTypeId: string;
            stock: number;
            sold: number;
        })[];
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
    private toImageUrl;
    private resolveUpdatedImageUrl;
    private parseAndValidateTickets;
    private getMinTicketPrice;
    private deleteLocalImage;
}
export {};
