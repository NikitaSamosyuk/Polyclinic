import { IsString, IsOptional, IsDateString } from 'class-validator';

export class RegisterPatientDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // --- Адрес ---
  @IsString()
  region: string;

  @IsString()
  city: string;

  @IsString()
  street: string;

  @IsString()
  houseNumber: string;

  @IsOptional()
  @IsString()
  apartment?: string;
}
