import { IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateVisitDto {
  @IsInt()
  appointmentId: number;

  @IsInt()
  patientId: number;

  @IsInt()
  doctorId: number;

  @IsISO8601()
  visitDatetime: string;

  @IsOptional()
  @IsString()
  complaints?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  examination?: string;

  @IsOptional()
  @IsString()
  treatment?: string;

  @IsOptional()
  @IsString()
  recommendations?: string;
}
