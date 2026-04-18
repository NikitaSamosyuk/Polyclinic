import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDoctorUserDto {
  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsString()
  passwordHash: string;
}

export class CreateDoctorProfileDto {
  @IsString()
  lastName: string;

  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  specialization: string;

  @IsOptional()
  @IsBoolean()
  isTherapist?: boolean;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateDoctorDto {
  user: CreateDoctorUserDto;
  doctor: CreateDoctorProfileDto;
}
