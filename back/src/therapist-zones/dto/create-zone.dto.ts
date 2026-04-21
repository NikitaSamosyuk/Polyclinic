import { IsInt, IsString } from 'class-validator';

export class CreateTherapistZoneDto {
  @IsInt()
  doctorId: number;

  @IsString()
  zone: string;
}
