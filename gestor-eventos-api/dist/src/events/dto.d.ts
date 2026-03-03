export declare class CreateEventDto {
    name: string;
    description: string;
    date: string;
    price: number;
    imageUrl?: string;
    categoryId: string;
}
export declare class UpdateEventDto {
    name?: string;
    description?: string;
    date?: string;
    price?: number;
    imageUrl?: string;
    categoryId?: string;
    isActive?: boolean;
}
