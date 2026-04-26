import {
  IsArray,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class DayScheduleDto {
  @IsInt()
  @Min(1)
  @Max(6)
  dayOfWeek!: number;
  // 1–5 — стандартные будни (Пн–Пт)
  // 6 — суббота (опционально, если поликлиника решит работать)

  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be in HH:MM format' })
  startTime!: string;

  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be in HH:MM format' })
  endTime!: string;
}

export class UpdateDoctorScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  days!: DayScheduleDto[];
}
