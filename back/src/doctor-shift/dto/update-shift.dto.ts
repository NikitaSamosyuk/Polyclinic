import { IsInt, IsOptional, IsString, Matches } from 'class-validator'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export class UpdateShiftDto {
  @IsInt()
  @IsOptional()
  doctorId?: number

  @IsInt()
  @IsOptional()
  cabinetId?: number

  // теперь Date
  @IsOptional()
  date?: Date

  @IsString()
  @Matches(TIME_REGEX)
  @IsOptional()
  startTime?: string

  @IsString()
  @Matches(TIME_REGEX)
  @IsOptional()
  endTime?: string
}
