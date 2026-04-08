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
            user: {
                id: string;
                name: string;
                email: string;
            };
            event: {
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
            };
            eventTicket: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            eventId: string;
            eventTicketId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            status: import("@prisma/client").$Enums.PurchaseStatus;
        };
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
            ticketTypeName: string;
            unitPrice: number;
            stock: number;
            sold: number;
            available: number;
            revenue: number;
        }[];
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
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            date: Date;
            price: number;
            imageUrl: string | null;
            categoryId: string;
        };
        eventTicket: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        eventId: string;
        eventTicketId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        status: import("@prisma/client").$Enums.PurchaseStatus;
    })[]>;
    findOne(id: string, req: AuthRequest): Promise<{
        event: {
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
        };
        eventTicket: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        eventId: string;
        eventTicketId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        status: import("@prisma/client").$Enums.PurchaseStatus;
    }>;
}
export {};
