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
            isExpired: boolean;
            _count: {
                interests: number;
            };
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                isActive: boolean;
            };
            eventTickets: ({
                ticketType: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    isActive: boolean;
                };
            } & {
                id: string;
                eventId: string;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                isActive: boolean;
                ticketTypeId: string;
                stock: number;
                sold: number;
            })[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string;
            date: Date;
            price: number;
            imageUrl: string | null;
            isActive: boolean;
            categoryId: string;
        }[];
    }>;
    listAdmin(): Promise<{
        interestCount: number;
        _count: {
            interests: number;
        };
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            isActive: boolean;
        };
        eventTickets: ({
            ticketType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                isActive: boolean;
            };
        } & {
            id: string;
            eventId: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            isActive: boolean;
            ticketTypeId: string;
            stock: number;
            sold: number;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        isActive: boolean;
        categoryId: string;
    }[]>;
    get(id: string): Promise<{
        interestCount: number;
        _count: {
            interests: number;
        };
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            isActive: boolean;
        };
        eventTickets: ({
            ticketType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                isActive: boolean;
            };
        } & {
            id: string;
            eventId: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            isActive: boolean;
            ticketTypeId: string;
            stock: number;
            sold: number;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        isActive: boolean;
        categoryId: string;
    }>;
    create(dto: CreateEventDto, image?: UploadedImage): Promise<{
        interestCount: number;
        _count: {
            interests: number;
        };
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            isActive: boolean;
        };
        eventTickets: ({
            ticketType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                isActive: boolean;
            };
        } & {
            id: string;
            eventId: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            isActive: boolean;
            ticketTypeId: string;
            stock: number;
            sold: number;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        isActive: boolean;
        categoryId: string;
    }>;
    update(id: string, dto: UpdateEventDto, image?: UploadedImage): Promise<{
        interestCount: number;
        _count: {
            interests: number;
        };
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            isActive: boolean;
        };
        eventTickets: ({
            ticketType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                isActive: boolean;
            };
        } & {
            id: string;
            eventId: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            isActive: boolean;
            ticketTypeId: string;
            stock: number;
            sold: number;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        isActive: boolean;
        categoryId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        isActive: boolean;
        categoryId: string;
    }>;
    private toImageUrl;
    private resolveUpdatedImageUrl;
    private parseAndValidateTickets;
    private getMinTicketPrice;
    private deleteLocalImage;
}
export {};
