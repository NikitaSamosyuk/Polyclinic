import { IsString, IsOptional, IsDateString, Matches } from 'class-validator';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/)
  middleName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(MALE|FEMALE)$/i)
  gender?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{9}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/)
  region?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/)
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/)
  street?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  houseNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  apartment?: string;
}
