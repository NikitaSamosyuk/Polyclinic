import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsBoolean()
  @IsOptional()
  isTherapist?: boolean;

  @IsInt()
  @IsOptional()
  cabinetId?: number;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
