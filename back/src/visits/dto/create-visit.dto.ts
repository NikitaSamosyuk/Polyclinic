import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateVisitDto {
  @IsInt()
  appointmentId: number;

  @IsDateString()
  visitDatetime: string;

  @IsString()
  @IsOptional()
  complaints?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  examination?: string;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsString()
  @IsOptional()
  recommendations?: string;
}
