import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID, Min

} from 'class-validator';

export class CreateTicketPurchaseDto {
  @IsUUID()
  eventTicketId!: string;

  @IsString()
  @IsNotEmpty()
  paymentTrackingId!: string;
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsString()
  @IsIn(['VISA', 'MASTERCARD', 'NU'])
  provider!: 'VISA' | 'MASTERCARD' | 'NU';

  @IsString()
  @IsNotEmpty()
  cardNumber!: string;

  @IsOptional()
  @IsString()
  cvv?: string;
}