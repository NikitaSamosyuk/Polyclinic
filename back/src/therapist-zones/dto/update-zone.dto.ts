import { IsString, IsOptional } from 'class-validator';

export class UpdateTherapistZoneDto {
  @IsString()
  @IsOptional()
  zone?: string;
}
