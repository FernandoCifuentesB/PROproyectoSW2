import type { Request } from 'express';
import { TicketPurchasesService } from './ticket-purchases.service';
import { CreateTicketPurchaseDto } from './dto/create-ticket-purchase.dto';
type AuthRequest = Request & {
    user: {
        userId: string;
        role: 'ADMIN' | 'USER';
    };
};
export declare class TicketPurchasesController {
    private readonly ticketPurchasesService;
    constructor(ticketPurchasesService: TicketPurchasesService);
    create(req: AuthRequest, dto: CreateTicketPurchaseDto): Promise<{
        message: string;
        payment: {
            id?: string;
            status?: string;
            providerResponse?: {
                approved?: boolean;
                reason?: string;
                code?: string;
                message?: string;
            };
        } | undefined;
        purchase: null;
    } | {
        message: string;
        purchase: {
            event: {
                id: string;
                price: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string;
                date: Date;
                imageUrl: string | null;
                categoryId: string;
            };
            eventTicket: {
                event: {
                    id: string;
                    price: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string;
                    date: Date;
                    imageUrl: string | null;
                    categoryId: string;
                };
                ticketType: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                };
            } & {
                id: string;
                eventId: string;
                ticketTypeId: string;
                price: number;
                stock: number;
                sold: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            eventTicketId: string;
            quantity: number;
            id: string;
            eventId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PurchaseStatus;
            unitPrice: number;
            totalPrice: number;
            userId: string;
        };
        payment: {
            id?: string;
            status?: string;
            providerResponse?: {
                approved?: boolean;
                reason?: string;
                code?: string;
                message?: string;
            };
        } | undefined;
    }>;
    getEventReport(eventId: string): Promise<{
        event: {
            id: string;
            name: string;
            date: Date;
        };
        summary: {
            totalSold: number;
            totalRevenue: number;
        };
        rows: {
            eventTicketId: string;
            ticketTypeId: string;
            ticketTypeName: string;
            unitPrice: number;
            stock: number;
            sold: number;
            available: number;
            revenue: number;
        }[];
    }>;
    getAdminSummary(): Promise<{
        totalSales: number;
        totalRevenue: number;
    }>;
    findMine(req: AuthRequest): Promise<({
        event: {
            id: string;
            price: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string;
            date: Date;
            imageUrl: string | null;
            categoryId: string;
        };
        eventTicket: {
            event: {
                id: string;
                price: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string;
                date: Date;
                imageUrl: string | null;
                categoryId: string;
            };
            ticketType: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            eventId: string;
            ticketTypeId: string;
            price: number;
            stock: number;
            sold: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        eventTicketId: string;
        quantity: number;
        id: string;
        eventId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        unitPrice: number;
        totalPrice: number;
        userId: string;
    })[]>;
    findOne(id: string, req: AuthRequest): Promise<{
        event: {
            id: string;
            price: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string;
            date: Date;
            imageUrl: string | null;
            categoryId: string;
        };
        eventTicket: {
            event: {
                id: string;
                price: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string;
                date: Date;
                imageUrl: string | null;
                categoryId: string;
            };
            ticketType: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            eventId: string;
            ticketTypeId: string;
            price: number;
            stock: number;
            sold: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        eventTicketId: string;
        quantity: number;
        id: string;
        eventId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        unitPrice: number;
        totalPrice: number;
        userId: string;
    }>;
}
export {};
