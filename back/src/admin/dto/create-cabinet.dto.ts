import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCabinetDto {
  @IsString()
  number: string;

  @IsOptional()
  @IsInt()
  floor?: number;

  @IsOptional()
  @IsInt()
  doctorId?: number;

  @IsString()
  workingHoursStart: string;

  @IsString()
  workingHoursEnd: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
