// src/api/appointments.ts
import api from './axios'

export const appointmentsApi = {
  getByDoctorId(id: number) {
    return api.get(`/appointments/doctor/${id}`)
  },

  getByPatientId(id: number) {
    return api.get(`/appointments/patient/${id}`)
  },
}
