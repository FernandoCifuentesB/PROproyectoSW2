import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    list(): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            events: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    })[]>;
    get(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    create(dto: CreateCategoryDto): import("@prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
}
