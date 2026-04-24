import api from './axios'

export const patientsApi = {
  async me() {
    try {
      const res = await api.get('/patients/me')
      return res.data
    } catch (err) {
      if (err?.response?.status === 404) return null
      throw err
    }
  },

  async register(dto) {
    const res = await api.post('/patients/register', dto)
    return res.data
  },

  async update(id, dto) {
    const res = await api.patch(`/patients/${id}`, dto)
    return res.data
  }
}
