import { IsBoolean, IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class UpdateEventTicketDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}