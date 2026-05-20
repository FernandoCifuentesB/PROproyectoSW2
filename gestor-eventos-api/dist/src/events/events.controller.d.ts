import { EventsService } from "./events.service";
import { CreateEventDto, UpdateEventDto } from "./dto";
type UploadedImage = {
    filename: string;
    mimetype: string;
    originalname: string;
};
export declare class EventsController {
    private readonly service;
    constructor(service: EventsService);
    getTopSoldPublicEvents(): Promise<any[]>;
    findPublicOne(id: string): Promise<{
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
    listPublic(page: number, pageSize: number, search?: string, categoryId?: string, minPrice?: string, maxPrice?: string, fromDate?: string, toDate?: string): Promise<{
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
}
export {};
