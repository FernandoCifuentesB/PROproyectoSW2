import { UsersService } from "./users.service";
export declare class UsersController {
    private readonly service;
    constructor(service: UsersService);
    getUsersReport(): Promise<{
        admins: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            createdAt: Date;
        }[];
        users: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            createdAt: Date;
        }[];
    }>;
}
