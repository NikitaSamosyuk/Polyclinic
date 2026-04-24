import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateTherapistZoneDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  houses?: string[];
}
