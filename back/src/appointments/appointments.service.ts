import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ScheduleService } from '../schedule/schedule.service'

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedule: ScheduleService,
  ) {}

  async create(patientUserId: number, dto: {
    doctorId: number
    date: string
    startTime: string
  }) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    })

    if (!patient) {
      throw new BadRequestException('Пациент не найден')
    }

    const { doctorId, date, startTime } = dto

    const shift = await this.schedule.getDoctorShift(doctorId, date)
    if (!shift) {
      throw new BadRequestException('Врач не работает в этот день')
    }

    const slots = await this.schedule.getSlotsForDoctor(doctorId, date)
    const slot = slots.slots.find((s) => s.start.toISOString().includes(startTime))

    if (!slot) {
      throw new BadRequestException('Слот не найден')
    }

    if (!slot.isFree) {
      throw new BadRequestException('Слот уже занят')
    }

    const start = new Date(`${date}T${startTime}:00`)
    const end = new Date(start.getTime() + shift.cabinet.slotDuration * 60_000)

    return this.prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        cabinetId: shift.cabinetId,
        appointmentDate: new Date(date),
        startTime: start,
        endTime: end,
      },
    })
  }
}
