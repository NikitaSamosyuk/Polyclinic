import api from './axios'

export interface UpdateAppointmentPayload {
  doctorId?: number
  date?: string
  startTime?: string
  reason?: string
}

export const appointmentsApi = {
  async getAll() {
    const res = await api.get('/appointments/all')
    return res.data
  },

  async getMy() {
    const res = await api.get('/appointments/my')
    return res.data
  },

  async getByDoctorId(id: number) {
    const res = await api.get(`/appointments/doctor/${id}`)
    return res.data
  },

  async create(data: any) {
    const res = await api.post('/appointments', data)
    return res.data
  },

  async update(id: number, data: UpdateAppointmentPayload) {
    const res = await api.patch(`/appointments/${id}`, data)
    return res.data
  },

  async delete(id: number) {
    const res = await api.delete(`/appointments/${id}`)
    return res.data
  },

  async deleteMy(id: number) {
    const res = await api.delete(`/appointments/my/${id}`)
    return res.data
  },
}

export const getMyAppointments = () => appointmentsApi.getMy()
export const getAllAppointments = () => appointmentsApi.getAll()
export const getAppointmentsByDoctor = (id: number) => appointmentsApi.getByDoctorId(id)
export const createAppointment = (data: any) => appointmentsApi.create(data)
export const updateAppointment = (id: number, data: UpdateAppointmentPayload) =>
  appointmentsApi.update(id, data)
export const deleteAppointment = (id: number) => appointmentsApi.delete(id)
export const deleteMyAppointment = (id: number) => appointmentsApi.deleteMy(id)
