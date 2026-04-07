import { IsBoolean, IsInt, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateEventTicketDto {
  @IsUUID()
  ticketTypeId!: string;

  @IsInt()
  @IsPositive()
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}