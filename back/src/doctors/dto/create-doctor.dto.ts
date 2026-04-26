import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDoctorDto {
  @IsInt()
  userId!: number;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  specialization!: string;

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
