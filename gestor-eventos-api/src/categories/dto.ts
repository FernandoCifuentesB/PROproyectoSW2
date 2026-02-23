import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @Length(2, 60)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(2, 60)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}