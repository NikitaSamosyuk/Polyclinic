import { IsInt, IsOptional, IsString, Matches } from 'class-validator'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export class CreateCabinetDto {
  @IsString()
  number!: string

  // Может быть "комбинированная" или любая другая строка
  @IsString()
  specialization!: string

  @IsString()
  @Matches(TIME_REGEX, { message: 'workingHoursStart must be in HH:MM format' })
  workingHoursStart!: string

  @IsString()
  @Matches(TIME_REGEX, { message: 'workingHoursEnd must be in HH:MM format' })
  workingHoursEnd!: string

  @IsInt()
  @IsOptional()
  slotDuration?: number
}
