import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Appointment, Cabinet, DoctorShift } from '@prisma/client'

export interface Slot {
  start: Date
  end: Date
  isFree: boolean
}

type ShiftWithCabinet = DoctorShift & { cabinet: Cabinet }

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDate(date: string): Date {
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException('Некорректная дата')
    }
    d.setHours(0, 0, 0, 0)
    return d
  }

  async getDoctorShift(doctorId: number, date: string): Promise<ShiftWithCabinet | null> {
    const day = this.parseDate(date)

    const shift = await this.prisma.doctorShift.findFirst({
      where: { doctorId, date: day },
      include: { cabinet: true },
    })

    if (!shift || !shift.cabinet.isActive) {
      return null
    }

    return shift
  }

  generateSlots(shift: ShiftWithCabinet): Slot[] {
    const durationMinutes = shift.cabinet.slotDuration

    const [startH, startM] = shift.startTime.split(':').map(Number)
    const [endH, endM] = shift.endTime.split(':').map(Number)

    const start = new Date(shift.date)
    start.setHours(startH, startM, 0, 0)

    const end = new Date(shift.date)
    end.setHours(endH, endM, 0, 0)

    const slots: Slot[] = []
    let current = new Date(start)

    while (current < end) {
      const next = new Date(current.getTime() + durationMinutes * 60_000)
      if (next > end) break

      slots.push({
        start: new Date(current),
        end: new Date(next),
        isFree: true,
      })

      current = next
    }

    return slots
  }

  async markBusySlots(doctorId: number, date: string, slots: Slot[]): Promise<Slot[]> {
    const day = this.parseDate(date)

    const appointments = await this.prisma.appointment.findMany({
      where: { doctorId, appointmentDate: day },
    })

    for (const slot of slots) {
      for (const a of appointments) {
        const busy = slot.start < a.endTime && slot.end > a.startTime
        if (busy) slot.isFree = false
      }
    }

    return slots
  }

  async getSlotsForDoctor(doctorId: number, date: string) {
    if (!date) throw new BadRequestException('Не указана дата')

    const shift = await this.getDoctorShift(doctorId, date)

    if (!shift) {
      return {
        doctorId,
        cabinetId: null,
        date,
        slots: [],
        message: 'Врач не работает в этот день',
      }
    }

    let slots = this.generateSlots(shift)
    slots = await this.markBusySlots(doctorId, date, slots)

    return {
      doctorId,
      cabinetId: shift.cabinetId,
      date,
      slots,
    }
  }

  async getPrimaryTherapist(patientUserId: number): Promise<number | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    })

    return patient?.primaryTherapistId ?? null
  }

  async getNearestSlotForTherapist(patientUserId: number) {
    const therapistId = await this.getPrimaryTherapist(patientUserId)
    if (!therapistId) throw new BadRequestException('У пациента нет участкового врача')

    for (let i = 0; i < 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const iso = date.toISOString().split('T')[0]

      const result = await this.getSlotsForDoctor(therapistId, iso)
      const free = result.slots.find((s) => s.isFree)

      if (free) {
        return {
          date: iso,
          doctorId: therapistId,
          cabinetId: result.cabinetId,
          slot: free,
        }
      }
    }

    return null
  }

  async getSlotsForAnyTherapist(date: string) {
    if (!date) throw new BadRequestException('Не указана дата')

    const therapists = await this.prisma.doctor.findMany({
      where: { isTherapist: true },
    })

    const results = []

    for (const t of therapists) {
      results.push(await this.getSlotsForDoctor(t.id, date))
    }

    return results
  }
}
