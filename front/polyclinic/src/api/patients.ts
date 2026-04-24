// src/api/patients.ts
import api from './axios'

export const patientsApi = {
  async me() {
    try {
      const res = await api.get('/patients/me')
      return res.data
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return null
      }
      throw err
    }
  },

  async register(dto) {
    const res = await api.post('/patients/register', dto)
    return res.data
  }
}
