import { IsInt, Matches } from 'class-validator';

export class GetSlotsDto {
  @IsInt()
  doctorId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Дата должна быть в формате YYYY-MM-DD',
  })
  date!: string;
}
