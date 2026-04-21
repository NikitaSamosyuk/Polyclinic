import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCabinetDto {
  @IsString()
  number: string;

  @IsString()
  specialization: string;

  @IsString()
  workingHoursStart: string;

  @IsString()
  workingHoursEnd: string;

  @IsInt()
  @IsOptional()
  slotDuration?: number;
}
