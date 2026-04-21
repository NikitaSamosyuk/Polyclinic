import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateCabinetDto {
  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  workingHoursStart?: string;

  @IsString()
  @IsOptional()
  workingHoursEnd?: string;

  @IsInt()
  @IsOptional()
  slotDuration?: number;

  @IsOptional()
  isActive?: boolean;
}
