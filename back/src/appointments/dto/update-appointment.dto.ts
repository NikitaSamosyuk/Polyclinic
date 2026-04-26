import { IsOptional, IsString, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class UpdateAppointmentDto {
  @IsOptional()
  @Matches(DATE_REGEX)
  date?: string;

  @IsOptional()
  @Matches(TIME_REGEX)
  startTime?: string;

  @IsOptional()
  @Matches(TIME_REGEX)
  endTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
