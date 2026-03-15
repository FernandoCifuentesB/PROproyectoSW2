import { PrismaService } from "../prisma/prisma.service";
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
