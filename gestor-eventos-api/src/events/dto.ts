import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, Length, Min } from "class-validator";

export class CreateEventDto {
  @IsString()
  @Length(2, 80)
  name!: string;

  @IsString()
  @Length(5, 2000)
  description!: string;

  @IsDateString()
  date!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsUUID()
  categoryId!: string;
}

export class UpdateEventDto {
  @IsOptional() @IsString() @Length(2, 80) name?: string;
  @IsOptional() @IsString() @Length(5, 2000) description?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsInt() @Min(0) price?: number;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}