import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateCabinetDto {
  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @Matches(TIME_REGEX, { message: 'workingHoursStart must be in HH:MM format' })
  @IsOptional()
  workingHoursStart?: string;

  @IsString()
  @Matches(TIME_REGEX, { message: 'workingHoursEnd must be in HH:MM format' })
  @IsOptional()
  workingHoursEnd?: string;

  @IsInt()
  @IsOptional()
  slotDuration?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
