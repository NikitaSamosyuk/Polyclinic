import api from './axios'

export const appointmentsApi = {
  async getMyAppointments() {
    const res = await api.get('/appointments')
    return res.data
  },

  async getDoctorAppointments(doctorId: number) {
    const res = await api.get(`/appointments/doctor/${doctorId}`)
    return res.data
  },

  async getAll() {
    const res = await api.get('/appointments/all')
    return res.data
  },

  async createSlot(data: any) {
    const res = await api.post('/appointments/slot', data)
    return res.data
  },

  async delete(id: number) {
    const res = await api.delete(`/appointments/${id}`)
    return res.data
  },
}
