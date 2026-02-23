import { IsString, IsUUID } from "class-validator";

export class ToggleInterestDto {
  @IsString()
  userId!: string;

  @IsUUID()
  eventId!: string;
}