import { InterestsService } from "./interests.service";
export declare class InterestsController {
    private readonly service;
    constructor(service: InterestsService);
    toggle(req: any, body: {
        eventId: string;
    }): Promise<{
        interested: boolean;
        interestCount: number;
    }>;
    myFavorites(req: any): Promise<{
        eventId: string;
        name: string;
        description: string;
        date: Date;
        price: number;
        imageUrl: string | null;
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        interestCount: number;
        interestedAt: Date;
    }[]>;
    reportByEvent(): Promise<{
        eventId: string;
        name: string;
        category: string;
        date: Date;
        price: number;
        interestCount: number;
        users: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            interestedAt: Date;
        }[];
    }[]>;
    reportTop(): Promise<{
        eventId: string;
        name: string;
        category: string;
        interestCount: number;
        date: Date;
        price: number;
    }[]>;
    getUsersByEvent(eventId: string): Promise<{
        eventId: string;
        name: string;
        category: string;
        interestCount: number;
        users: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            interestedAt: Date;
        }[];
    }>;
}
