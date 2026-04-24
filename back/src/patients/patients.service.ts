import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { TherapistZonesService } from '../therapist-zones/therapist-zones.service';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly zones: TherapistZonesService,
  ) {}

  // ============================================================
  // ВАЛИДАЦИИ
  // ============================================================

  private validateRussian(value: string, field: string): string {
    const trimmed = value.trim();
    if (!trimmed) throw new BadRequestException(`${field} обязательно`);

    if (!/^[А-ЯЁа-яё\s-]+$/.test(trimmed)) {
      throw new BadRequestException(
        `${field} должно содержать только русские буквы, пробелы и дефис`,
      );
    }

    return trimmed;
  }

  private validateDigits(value: string, field: string): string {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
      throw new BadRequestException(`${field} должно содержать только цифры`);
    }
    return trimmed;
  }

  private normalizePhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 9) {
      throw new BadRequestException(
        'Телефон должен содержать ровно 9 цифр (без кода страны)',
      );
    }
    return `+375${digits}`;
  }

  private normalizeRegion(raw: string): string {
    if (!raw) throw new BadRequestException('Область обязательна');

    let r = raw.trim().toLowerCase();

    r = r.replace(/область$/i, '');
    r = r.replace(/обл\.?$/i, '');

    const first = r.split(/\s+/)[0];
    if (!first) throw new BadRequestException('Некорректная область');

    const normalized =
      first.charAt(0).toUpperCase() + first.slice(1);

    if (!/^[А-ЯЁа-яё-]+$/.test(normalized)) {
      throw new BadRequestException(
        'Область должна содержать только русские буквы и дефис',
      );
    }

    return `${normalized} область`;
  }

  private validateBirthDate(raw: string): Date {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Некорректная дата рождения');
    }

    const now = new Date();
    if (date > now) {
      throw new BadRequestException('Дата рождения не может быть в будущем');
    }

    const age = now.getFullYear() - date.getFullYear();
    const m = now.getMonth() - date.getMonth();
    const beforeBirthday = m < 0 || (m === 0 && now.getDate() < date.getDate());
    const realAge = beforeBirthday ? age - 1 : age;

    if (realAge < 18) {
      throw new BadRequestException('Пациент должен быть старше 18 лет');
    }

    return date;
  }

  // ============================================================
  // НОРМАЛИЗАЦИЯ ПОЛА
  // ============================================================

  private normalizeGender(raw?: string): string | null {
    if (!raw) return null;

    const g = raw.trim().toUpperCase();

    if (g !== 'MALE' && g !== 'FEMALE') {
      throw new BadRequestException('Пол должен быть MALE или FEMALE');
    }

    return g;
  }

  // ============================================================
  // НОРМАЛИЗАЦИЯ АДРЕСА
  // ============================================================

  private normalizeStreet(raw: string): string {
    return raw.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private normalizeHouse(raw: string): string {
    return raw.trim().toLowerCase();
  }

  // ============================================================
  // АВТО-НАЗНАЧЕНИЕ ТЕРАПЕВТА
  // ============================================================

  private async autoAssignTherapist(region: string, city: string, street: string, house: string) {
    const isMinsk =
      region === 'Минская область' &&
      city.trim().toLowerCase() === 'минск';

    if (isMinsk) {
      const zone = await this.zones.findTherapistByAddress(street, house);
      if (zone) return zone.doctorId;
    }

    const therapists = await this.prisma.doctor.findMany({
      where: { isTherapist: true },
      include: { patients: true },
    });

    if (therapists.length === 0) {
      throw new BadRequestException('Нет доступных терапевтов');
    }

    therapists.sort((a, b) => a.patients.length - b.patients.length);

    return therapists[0].id;
  }

  // ============================================================
  // СОЗДАНИЕ ПАЦИЕНТА
  // ============================================================

  async createPatient(userId: number, dto: RegisterPatientDto) {
    const exists = await this.prisma.patient.findUnique({ where: { userId } });
    if (exists) throw new BadRequestException('Профиль пациента уже существует');

    const firstName = this.validateRussian(dto.firstName, 'Имя');
    const lastName = this.validateRussian(dto.lastName, 'Фамилия');
    const middleName = dto.middleName
      ? this.validateRussian(dto.middleName, 'Отчество')
      : null;

    const birthDate = this.validateBirthDate(dto.birthDate);
    const phone = this.normalizePhone(dto.phone);

    const region = this.normalizeRegion(dto.region);
    const city = this.validateRussian(dto.city, 'Город');
    const street = this.validateRussian(dto.street, 'Улица');
    const houseNumber = this.validateDigits(dto.houseNumber, 'Номер дома');
    const apartment = dto.apartment
      ? this.validateDigits(dto.apartment, 'Квартира')
      : null;

    const normalizedStreet = this.normalizeStreet(street);
    const normalizedHouse = this.normalizeHouse(houseNumber);

    const primaryTherapistId = await this.autoAssignTherapist(
      region,
      city,
      normalizedStreet,
      normalizedHouse,
    );

    return this.prisma.patient.create({
      data: {
        userId,
        firstName,
        lastName,
        middleName,
        birthDate,
        gender: this.normalizeGender(dto.gender),
        phone,
        region,
        city,
        street,
        houseNumber,
        apartment,
        primaryTherapistId,
        isActive: true,
      },
      include: {
        primaryTherapist: { include: { cabinet: true } },
        user: true,
      },
    });
  }

  // ============================================================
  // ДЕАКТИВАЦИЯ
  // ============================================================

  async deactivatePatient(id: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundException('Пациент не найден');

    return this.prisma.patient.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============================================================
  // ПОЛУЧЕНИЕ ПРОФИЛЯ
  // ============================================================

  async getByUserId(userId: number) {
    const patient = await this.prisma.patient.findFirst({
      where: { userId },
      include: {
        user: true,
        primaryTherapist: { include: { cabinet: true } },
      },
    });

    if (!patient) throw new NotFoundException('Пациент не найден');
    return patient;
  }

  async getByIdForDoctorOrAdmin(
    patientId: number,
    actorUserId: number,
    actorRole: string,
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        primaryTherapist: true,
      },
    });

    if (!patient) throw new NotFoundException('Пациент не найден');

    if (actorRole === 'ADMIN') return patient;

    if (actorRole !== 'DOCTOR') {
      throw new ForbiddenException('Доступ запрещён');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: actorUserId },
    });

    if (!doctor) throw new ForbiddenException('Профиль врача не найден');

    const isTherapistPatient =
      patient.primaryTherapistId === doctor.id;

    const hasAppointment = await this.prisma.appointment.findFirst({
      where: { doctorId: doctor.id, patientId: patient.id },
    });

    const hasVisit = await this.prisma.visit.findFirst({
      where: { doctorId: doctor.id, patientId: patient.id },
    });

    if (!isTherapistPatient && !hasAppointment && !hasVisit) {
      throw new ForbiddenException('Нет доступа к этому пациенту');
    }

    return patient;
  }

  // ============================================================
  // СПИСОК ПАЦИЕНТОВ
  // ============================================================

  async getAllForDoctorOrAdmin(actorUserId: number, actorRole: string) {
    if (actorRole === 'ADMIN') {
      return this.prisma.patient.findMany({
        include: {
          user: true,
          primaryTherapist: true,
        },
        orderBy: { lastName: 'asc' },
      });
    }

    if (actorRole !== 'DOCTOR') {
      throw new ForbiddenException('Доступ запрещён');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: actorUserId },
    });

    if (!doctor) throw new ForbiddenException('Профиль врача не найден');

    return this.prisma.patient.findMany({
      where: {
        OR: [
          { primaryTherapistId: doctor.id },
          { appointments: { some: { doctorId: doctor.id } } },
          { visits: { some: { doctorId: doctor.id } } },
        ],
      },
      include: {
        user: true,
        primaryTherapist: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  // ============================================================
  // ОБНОВЛЕНИЕ
  // ============================================================

async updatePatient(
  patientId: number,
  actorUserId: number,
  actorRole: string,
  dto: UpdatePatientDto,
) {
  const patient = await this.prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) throw new NotFoundException('Пациент не найден');

  if (actorRole !== 'ADMIN' && patient.userId !== actorUserId) {
    throw new ForbiddenException('Можно изменять только свой профиль');
  }

  const data: Record<string, unknown> = {};

  // --- ОБНОВЛЕНИЕ ПОЛЕЙ ---
  if (dto.firstName !== undefined) {
    data.firstName = this.validateRussian(dto.firstName, 'Имя');
  }
  if (dto.lastName !== undefined) {
    data.lastName = this.validateRussian(dto.lastName, 'Фамилия');
  }
  if (dto.middleName !== undefined) {
    data.middleName = dto.middleName
      ? this.validateRussian(dto.middleName, 'Отчество')
      : null;
  }
  if (dto.birthDate !== undefined) {
    data.birthDate = this.validateBirthDate(dto.birthDate);
  }
  if (dto.phone !== undefined) {
    data.phone = this.normalizePhone(dto.phone);
  }
  if (dto.region !== undefined) {
    data.region = this.normalizeRegion(dto.region);
  }
  if (dto.city !== undefined) {
    data.city = this.validateRussian(dto.city, 'Город');
  }
  if (dto.street !== undefined) {
    data.street = this.validateRussian(dto.street, 'Улица');
  }
  if (dto.houseNumber !== undefined) {
    data.houseNumber = this.validateDigits(dto.houseNumber, 'Номер дома');
  }
  if (dto.apartment !== undefined) {
    data.apartment = dto.apartment
      ? this.validateDigits(dto.apartment, 'Квартира')
      : null;
  }
  if (dto.gender !== undefined) {
    data.gender = this.normalizeGender(dto.gender);
  }

  // ============================================================
  // АВТО-ПЕРЕНАЗНАЧЕНИЕ ТЕРАПЕВТА ПРИ ИЗМЕНЕНИИ АДРЕСА
  // ============================================================

  const addressChanged =
    dto.region !== undefined ||
    dto.city !== undefined ||
    dto.street !== undefined ||
    dto.houseNumber !== undefined;

  if (addressChanged) {
    const region = dto.region
      ? this.normalizeRegion(dto.region)
      : patient.region;

    const city = dto.city
      ? this.validateRussian(dto.city, 'Город')
      : patient.city;

    const street = dto.street
      ? this.validateRussian(dto.street, 'Улица')
      : patient.street;

    const house = dto.houseNumber
      ? this.validateDigits(dto.houseNumber, 'Номер дома')
      : patient.houseNumber;

    const normalizedStreet = this.normalizeStreet(street);
    const normalizedHouse = this.normalizeHouse(house);

    const newTherapistId = await this.autoAssignTherapist(
      region,
      city,
      normalizedStreet,
      normalizedHouse,
    );

    data.primaryTherapistId = newTherapistId;
  }

  // ============================================================

  return this.prisma.patient.update({
    where: { id: patientId },
    data,
    include: {
      user: true,
      primaryTherapist: true,
    },
  });
}


  // ============================================================
  // ПОИСК
  // ============================================================

  async search(query: string, actorUserId: number, actorRole: string) {
    if (actorRole !== 'DOCTOR' && actorRole !== 'ADMIN') {
      throw new ForbiddenException('Доступ запрещён');
    }

    const whereBase = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { middleName: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query } },
        { medicalCardNumber: { contains: query } },
      ],
    };

    if (actorRole === 'ADMIN') {
      return this.prisma.patient.findMany({
        where: whereBase,
        include: {
          user: true,
          primaryTherapist: true,
        },
        orderBy: { lastName: 'asc' },
      });
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: actorUserId },
    });

    if (!doctor) throw new ForbiddenException('Профиль врача не найден');

    return this.prisma.patient.findMany({
      where: {
        AND: [
          whereBase,
          {
            OR: [
              { primaryTherapistId: doctor.id },
              { appointments: { some: { doctorId: doctor.id } } },
              { visits: { some: { doctorId: doctor.id } } },
            ],
          },
        ],
      },
      include: {
        user: true,
        primaryTherapist: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }
}
