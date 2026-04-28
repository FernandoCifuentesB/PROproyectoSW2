export declare class CreateEventDto {
    name: string;
    description: string;
    date: string;
    imageUrl?: string;
    tickets: string;
    categoryId: string;
}
export declare class UpdateEventDto {
    name?: string;
    description?: string;
    date?: string;
    imageUrl?: string;
    tickets?: string;
    removeImage?: string;
    categoryId?: string;
    isActive?: boolean;
}
