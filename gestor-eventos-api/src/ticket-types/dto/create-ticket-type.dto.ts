import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTicketTypeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}