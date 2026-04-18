import { IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  doctorId: number;

  @IsInt()
  cabinetId: number;

  @IsISO8601()
  startTime: string;

  @IsISO8601()
  endTime: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
