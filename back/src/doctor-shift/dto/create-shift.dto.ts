import { IsInt, IsOptional, IsString, Matches } from 'class-validator'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export class CreateShiftDto {
  @IsInt()
  doctorId!: number

  @IsInt()
  cabinetId!: number

  // теперь Date
  @IsOptional()
  date!: Date

  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be in HH:MM format' })
  startTime!: string

  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be in HH:MM format' })
  endTime!: string
}
