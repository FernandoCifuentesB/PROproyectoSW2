import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    list(): any;
    get(id: string): Promise<any>;
    create(dto: CreateCategoryDto): any;
    update(id: string, dto: UpdateCategoryDto): Promise<any>;
    remove(id: string): Promise<any>;
}
