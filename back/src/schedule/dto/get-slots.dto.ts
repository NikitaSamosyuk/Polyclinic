import { IsDateString, IsInt } from 'class-validator';

export class GetSlotsDto {
  @IsInt()
  doctorId: number;

  @IsDateString()
  date: string;
}
