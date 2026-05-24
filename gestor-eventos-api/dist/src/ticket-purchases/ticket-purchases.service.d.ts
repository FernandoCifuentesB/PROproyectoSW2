import { PrismaService } from '@/prisma/prisma.service';
import { PaymentEventsGateway } from '@/payment-events/payment-events.gateway';
import { PaymentEventsService } from '@/payment-events/payment-events.service';
import { CreateTicketPurchaseDto } from './dto/create-ticket-purchase.dto';
export declare class TicketPurchasesService {
    private readonly prisma;
    private readonly paymentEventsGateway;
    private readonly paymentEventsService;
    constructor(prisma: PrismaService, paymentEventsGateway: PaymentEventsGateway, paymentEventsService: PaymentEventsService);
    create(userId: string, dto: CreateTicketPurchaseDto): Promise<{
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
    private sendPaymentToGateway;
    findMine(userId: string): Promise<({
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
}
