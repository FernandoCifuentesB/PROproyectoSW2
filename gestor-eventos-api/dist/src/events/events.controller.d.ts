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
    listPublic(page: number, pageSize: number, search?: string, categoryId?: string, minPrice?: string, maxPrice?: string, fromDate?: string, toDate?: string): Promise<{
        page: any;
        pageSize: any;
        total: number;
        items: {
            interestCount: number;
            isExpired: boolean;
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
}
export {};
