import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, Length } from "class-validator";

export class CreateEventDto {
  @IsString()
  @Length(2, 80)
  name!: string;

  @IsString()
  @Length(5, 2000)
  description!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  tickets!: string;

  @IsUUID() categoryId!: string;
}

export class UpdateEventDto {
  @IsOptional() @IsString() @Length(2, 80) name?: string;
  @IsOptional() @IsString() @Length(5, 2000) description?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() tickets?: string;
  @IsOptional() @IsString() removeImage?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @Transform(({ value }) =>
    value === "true" ? true : value === "false" ? false : value
  )
  @IsOptional() @IsBoolean() isActive?: boolean;
}
