import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTicketPurchaseDto {
  
  @IsString()
  @IsNotEmpty()
  eventTicketId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsIn(['VISA', 'MASTERCARD', 'NU'])
  provider!: 'VISA' | 'MASTERCARD' | 'NU';

  @IsString()
  @IsNotEmpty()
  cardNumber!: string;

  @IsOptional()
  @IsString()
  cvv?: string;

  @IsString()
  @IsNotEmpty()
  paymentTrackingId!: string;
}
