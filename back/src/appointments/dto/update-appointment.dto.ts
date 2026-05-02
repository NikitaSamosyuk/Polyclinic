import { IsOptional, IsString, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  @Matches(DATE_REGEX, { message: 'date must be in YYYY-MM-DD format' })
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be in HH:MM format' })
  startTime?: string;

  // endTime админ явно не задаёт — пересчитываем по слоту, но поле оставим на будущее
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be in HH:MM format' })
  endTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
