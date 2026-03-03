import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(input: {
        name: string;
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    login(input: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
}
