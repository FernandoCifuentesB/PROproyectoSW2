import { PrismaService } from '@/prisma/prisma.service';
import { CreateTicketPurchaseDto } from './dto/create-ticket-purchase.dto';
import { EventsService } from '@/events/events.service';
export declare class TicketPurchasesService {
    private readonly prisma;
    private readonly eventsService;
    constructor(prisma: PrismaService, eventsService: EventsService);
    create(userId: string, dto: CreateTicketPurchaseDto): Promise<{
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
    findMine(userId: string): Promise<({
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
    findOne(id: string, userId: string): Promise<{
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
    getAdminSummary(): Promise<{
        totalRevenue: number;
        activeEvents: number;
        pastEvents: number;
        registeredUsers: number;
    }>;
}
