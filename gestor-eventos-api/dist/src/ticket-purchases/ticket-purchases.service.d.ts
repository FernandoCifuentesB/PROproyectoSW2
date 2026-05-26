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
            provider?: string;
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
                createdAt: Date;
                updatedAt: Date;
                price: number;
                isActive: boolean;
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
                event: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    price: number;
                    isActive: boolean;
                    name: string;
                    description: string;
                    date: Date;
                    imageUrl: string | null;
                    categoryId: string;
                };
                ticketType: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                    name: string;
                    description: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                eventId: string;
                ticketTypeId: string;
                price: number;
                stock: number;
                sold: number;
                isActive: boolean;
            };
        } & {
            id: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            status: import("@prisma/client").$Enums.PurchaseStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            eventId: string;
            eventTicketId: string;
        };
        payment: {
            id?: string;
            status?: string;
            provider?: string;
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
        event: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            isActive: boolean;
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
            event: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                isActive: boolean;
                name: string;
                description: string;
                date: Date;
                imageUrl: string | null;
                categoryId: string;
            };
            ticketType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            eventId: string;
            ticketTypeId: string;
            price: number;
            stock: number;
            sold: number;
            isActive: boolean;
        };
    } & {
        id: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        eventId: string;
        eventTicketId: string;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        event: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            isActive: boolean;
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
            event: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                isActive: boolean;
                name: string;
                description: string;
                date: Date;
                imageUrl: string | null;
                categoryId: string;
            };
            ticketType: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            eventId: string;
            ticketTypeId: string;
            price: number;
            stock: number;
            sold: number;
            isActive: boolean;
        };
    } & {
        id: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        eventId: string;
        eventTicketId: string;
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
