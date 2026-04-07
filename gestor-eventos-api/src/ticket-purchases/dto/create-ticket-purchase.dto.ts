import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateTicketPurchaseDto {
  @IsUUID()
  eventTicketId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}