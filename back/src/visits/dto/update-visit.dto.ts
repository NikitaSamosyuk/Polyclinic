import { IsString, IsOptional } from 'class-validator';

export class UpdateVisitDto {
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
