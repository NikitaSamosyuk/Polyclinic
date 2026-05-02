import { IsOptional, IsString } from 'class-validator';

export class UpdateVisitDto {
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
