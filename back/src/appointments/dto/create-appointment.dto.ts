import { IsInt, IsString, IsOptional, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class CreateAppointmentDto {
  @IsInt()
  doctorId!: number;

  @IsString()
  @Matches(DATE_REGEX, { message: 'date must be in YYYY-MM-DD format' })
  date!: string;

  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be in HH:MM format' })
  startTime!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
