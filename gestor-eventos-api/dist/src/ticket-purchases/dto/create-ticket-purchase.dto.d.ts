export declare class CreateTicketPurchaseDto {
    eventTicketId: string;
    paymentTrackingId: string;
    quantity: number;
    provider: 'VISA' | 'MASTERCARD' | 'NU';
    cardNumber: string;
    cvv?: string;
}
