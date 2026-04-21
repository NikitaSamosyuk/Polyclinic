// src/api/patients.ts
import api from './axios'

export const patientsApi = {
  async getAll() {
    try {
      const res = await api.get('/patients')
      console.log('[API] GET /patients', res.status, res.data)
      return res.data
    } catch (err) {
      console.error('[API] GET /patients error', err?.response?.status, err?.response?.data)
      throw err
    }
  },

  async getByUserId(userId: number) {
    try {
      const res = await api.get(`/patients/user/${userId}`)
      console.log('[API] GET /patients/user/:userId', `/patients/user/${userId}`, res.status, res.data)
      return res.data
    } catch (err) {
      console.error('[API] GET /patients/user/:userId error', `/patients/user/${userId}`, err?.response?.status, err?.response?.data)
      throw err
    }
  },
}
