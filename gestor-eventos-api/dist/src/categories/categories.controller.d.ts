import { CategoriesService } from "./categories.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";
export declare class CategoriesController {
    private service;
    constructor(service: CategoriesService);
    list(): any;
    get(id: string): Promise<any>;
    create(dto: CreateCategoryDto): any;
    update(id: string, dto: UpdateCategoryDto): Promise<any>;
    remove(id: string): Promise<any>;
}
