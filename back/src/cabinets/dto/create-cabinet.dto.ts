import { IsInt, IsOptional, IsString, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateCabinetDto {
  @IsString()
  number!: string;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsString()
  specialization!: string;

  @IsString()
  @Matches(TIME_REGEX)
  workingHoursStart!: string;

  @IsString()
  @Matches(TIME_REGEX)
  workingHoursEnd!: string;

  @IsInt()
  @IsOptional()
  slotDuration?: number;
}
