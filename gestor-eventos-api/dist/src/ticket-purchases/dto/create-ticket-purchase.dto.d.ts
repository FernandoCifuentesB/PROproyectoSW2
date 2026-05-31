export declare class CreateTicketPurchaseDto {
    eventTicketId: string;
    quantity: number;
    provider: 'VISA' | 'MASTERCARD' | 'NU';
    cardNumber: string;
    cvv?: string;
    paymentTrackingId: string;
}
