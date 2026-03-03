import { EventsService } from "./events.service";
import { CreateEventDto, UpdateEventDto } from "./dto";
export declare class EventsController {
    private service;
    constructor(service: EventsService);
    listPublic(page?: string, pageSize?: string, search?: string, categoryId?: string, minPrice?: string, maxPrice?: string, fromDate?: string, toDate?: string): Promise<{
        page: number;
        pageSize: number;
        total: any;
        items: any;
    }>;
    listAdmin(): Promise<any>;
    get(id: string): Promise<any>;
    create(dto: CreateEventDto): Promise<any>;
    update(id: string, dto: UpdateEventDto): Promise<any>;
    remove(id: string): Promise<any>;
}
