import { PrismaService } from '@/prisma/prisma.service';
import { CreateTicketPurchaseDto } from './dto/create-ticket-purchase.dto';
import { EventsService } from '@/events/events.service';
export declare class TicketPurchasesService {
    private readonly prisma;
    private readonly eventsService;
    constructor(prisma: PrismaService, eventsService: EventsService);
    getEventSalesReport(eventId: string): Promise<{
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
    create(userId: string, dto: CreateTicketPurchaseDto): Promise<{
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
    findMine(userId: string): Promise<({
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
    findOne(id: string, userId: string): Promise<{
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
    getAdminSummary(): Promise<{
        totalRevenue: number;
        activeEvents: number;
        pastEvents: number;
        registeredUsers: number;
    }>;
}
