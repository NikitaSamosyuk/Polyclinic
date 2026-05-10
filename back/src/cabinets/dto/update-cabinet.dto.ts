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
  number?: string;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @Matches(TIME_REGEX)
  @IsOptional()
  workingHoursStart?: string;

  @IsString()
  @Matches(TIME_REGEX)
  @IsOptional()
  workingHoursEnd?: string;

  @IsInt()
  @IsOptional()
  slotDuration?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
