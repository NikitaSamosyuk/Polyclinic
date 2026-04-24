import { IsInt, IsString, IsArray } from 'class-validator';

export class CreateTherapistZoneDto {
  @IsInt()
  doctorId: number;

  @IsString()
  street: string;

  @IsArray()
  @IsString({ each: true })
  houses: string[]; // ["10", "12", "5-20"]
}
