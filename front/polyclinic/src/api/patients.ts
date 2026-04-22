// src/api/patients.ts
import api from './axios'

export const patientsApi = {
  async getByUserId(userId: number) {
    try {
      const res = await api.get(`/patients/user/${userId}`)
      return res.data
    } catch (err: any) {
      // Если 404 — возвращаем null (пациент не создан)
      if (err?.response?.status === 404) {
        console.warn(`[API] GET /patients/user/${userId} 404 -> returning null`)
        return null
      }
      // Для остальных ошибок пробрасываем дальше
      throw err
    }
  },

  // другие методы...
}
