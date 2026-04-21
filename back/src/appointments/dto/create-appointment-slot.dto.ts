import { IsInt, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentSlotDto {
  @IsInt()
  doctorId: number;

  @IsInt()
  cabinetId: number;

  @IsDateString()
  appointmentDate: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  reason?: string;
}
