// src/api/patients.ts
import api from './axios'

export const patientsApi = {
  // Получить всех пациентов (админ)
  async getAll() {
    const res = await api.get('/patients')
    return res.data
  },

  // Профиль текущего пациента
  async getMyProfile() {
    try {
      const res = await api.get('/patients/me')
      return res.data
    } catch (err) {
      if (err?.response?.status === 404) return null
      throw err
    }
  },

  // Алиас
  me() {
    return this.getMyProfile()
  },

  // Получить пациента по ID
  async getById(id: number) {
    const res = await api.get(`/patients/${id}`)
    return res.data
  },

  // Регистрация пациента
  async register(dto: any) {
    const res = await api.post('/patients/register', dto)
    return res.data
  },

  // Обновление пациента
  async update(id: number, dto: any) {
    const res = await api.patch(`/patients/${id}`, dto)
    return res.data
  },
}

// Алиасы
export const getPatients = () => patientsApi.getAll()
export const getMyProfile = () => patientsApi.getMyProfile()
export const getPatientById = (id: number) => patientsApi.getById(id)
