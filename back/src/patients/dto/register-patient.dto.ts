import { IsString, IsOptional, IsDateString, Matches } from 'class-validator';

export class RegisterPatientDto {
  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/, { message: 'Имя только русскими буквами' })
  firstName: string;

  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/, { message: 'Фамилия только русскими буквами' })
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/, {
    message: 'Отчество только русскими буквами',
  })
  middleName?: string;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsString()
  @Matches(/^(MALE|FEMALE)$/i, {
    message: 'Пол должен быть MALE или FEMALE',
  })
  gender?: string;

  @IsString()
  @Matches(/^\d{9}$/, { message: 'Телефон должен содержать 9 цифр' })
  phone: string;

  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/, { message: 'Область только русскими буквами' })
  region: string;

  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/, { message: 'Город только русскими буквами' })
  city: string;

  @IsString()
  @Matches(/^[А-ЯЁа-яё\s-]+$/, { message: 'Улица только русскими буквами' })
  street: string;

  @IsString()
  @Matches(/^\d+$/, { message: 'Номер дома только цифры' })
  houseNumber: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'Квартира только цифры' })
  apartment?: string;
}
