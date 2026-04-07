import { TicketPurchasesService } from "./ticket-purchases.service";
import { CreateTicketPurchaseDto } from "./dto/create-ticket-purchase.dto";
export declare class TicketPurchasesController {
    private readonly ticketPurchasesService;
    constructor(ticketPurchasesService: TicketPurchasesService);
    create(req: any, dto: CreateTicketPurchaseDto): Promise<{
        message: string;
        purchase: {
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
    findMine(req: any): Promise<({
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
}
