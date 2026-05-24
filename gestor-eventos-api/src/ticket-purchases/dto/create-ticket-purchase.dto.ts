import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTicketPurchaseDto {
  @IsUUID()
  eventTicketId!: string;

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