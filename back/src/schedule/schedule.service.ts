import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  // --- Получить смену врача на дату ---
  async getDoctorShift(doctorId: number, date: string) {
    const shift = await this.prisma.doctorShift.findFirst({
      where: {
        doctorId,
        date: new Date(date),
      },
      include: {
        cabinet: true,
      },
    });

    if (!shift) return null;

    return shift;
  }

  // --- Генерация слотов ---
  generateSlots(shift: any) {
    const duration = shift.cabinet.slotDuration; // минут
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);

    const start = new Date(shift.date);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(shift.date);
    end.setHours(endH, endM, 0, 0);

    const slots = [];

    let current = new Date(start);

    while (current < end) {
      const next = new Date(current.getTime() + duration * 60000);

      if (next > end) break;

      slots.push({
        start: new Date(current),
        end: new Date(next),
        isFree: true,
      });

      current = next;
    }

    return slots;
  }

  // --- Убрать занятые слоты ---
  async markBusySlots(doctorId: number, date: string, slots: any[]) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: new Date(date),
      },
    });

    for (const slot of slots) {
      for (const a of appointments) {
        const busy = slot.start < a.endTime && slot.end > a.startTime;

        if (busy) slot.isFree = false;
      }
    }

    return slots;
  }

  // --- Получить слоты врача ---
  async getSlotsForDoctor(doctorId: number, date: string) {
    const shift = await this.getDoctorShift(doctorId, date);

    if (!shift) {
      return { slots: [], message: 'Врач не работает в этот день' };
    }

    let slots = this.generateSlots(shift);
    slots = await this.markBusySlots(doctorId, date, slots);

    return {
      doctorId,
      cabinetId: shift.cabinetId,
      date,
      slots,
    };
  }

  // --- Получить участкового пациента ---
  async getPrimaryTherapist(patientUserId: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });

    if (!patient || !patient.primaryTherapistId) return null;

    return patient.primaryTherapistId;
  }

  // --- Найти ближайший свободный слот участкового ---
  async getNearestSlotForTherapist(patientUserId: number) {
    const therapistId = await this.getPrimaryTherapist(patientUserId);

    if (!therapistId) {
      throw new BadRequestException('У пациента нет участкового');
    }

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const iso = date.toISOString().split('T')[0];

      const result = await this.getSlotsForDoctor(therapistId, iso);

      const free = result.slots.find((s) => s.isFree);

      if (free) {
        return {
          date: iso,
          doctorId: therapistId,
          slot: free,
        };
      }
    }

    return null;
  }

  // --- Найти свободные слоты любого терапевта ---
  async getSlotsForAnyTherapist(date: string) {
    const therapists = await this.prisma.doctor.findMany({
      where: { isTherapist: true },
    });

    const results = [];

    for (const t of therapists) {
      const r = await this.getSlotsForDoctor(t.id, date);
      results.push(r);
    }

    return results;
  }
}
