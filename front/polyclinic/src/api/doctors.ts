import api from './axios'

export const doctorsApi = {
  async getByUserId(userId: number) {
    const res = await api.get(`/doctors/user/${userId}`)
    return res.data
  },

  async getAll() {
    const res = await api.get('/doctors')
    return res.data
  },
}
