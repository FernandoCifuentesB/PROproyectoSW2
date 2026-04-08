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
            user: {
                id: string;
                name: string;
                email: string;
            };
            eventTicket: {
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
        } & {
            id: string;
            eventId: string;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            status: import("@prisma/client").$Enums.PurchaseStatus;
            userId: string;
            eventTicketId: string;
        };
    }>;
    getAdminSummary(): Promise<{
        totalRevenue: number;
        activeEvents: number;
        pastEvents: number;
        registeredUsers: number;
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
    } & {
        id: string;
        eventId: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        userId: string;
        eventTicketId: string;
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
    } & {
        id: string;
        eventId: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        userId: string;
        eventTicketId: string;
    }>;
}
export {};
