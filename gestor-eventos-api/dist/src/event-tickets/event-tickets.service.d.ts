import { PrismaService } from '@/prisma/prisma.service';
import { CreateEventTicketDto } from './dto/create-event-ticket.dto';
import { UpdateEventTicketDto } from './dto/update-event-ticket.dto';
export declare class EventTicketsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEvent(eventId: string): Promise<({
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
    })[]>;
    findAvailableByEvent(eventId: string): Promise<({
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
    })[]>;
    create(eventId: string, dto: CreateEventTicketDto): Promise<{
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
    }>;
    update(eventId: string, eventTicketId: string, dto: UpdateEventTicketDto): Promise<{
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
    }>;
    remove(eventId: string, eventTicketId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        eventId: string;
        ticketTypeId: string;
        stock: number;
        sold: number;
    }>;
    private ensureEventExists;
}
