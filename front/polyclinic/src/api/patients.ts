import api from './axios'

export const patientsApi = {
  // Получить всех пациентов (для админа)
  async getAll() {
    const res = await api.get('/patients')
    return res.data
  },

  // Получить профиль текущего пациента
  async getMyProfile() {
    try {
      const res = await api.get('/patients/me')
      return res.data
    } catch (err) {
      if (err?.response?.status === 404) return null
      throw err
    }
  },

  // Алиас для совместимости со старым кодом
  me() {
    return this.getMyProfile()
  },

  // Получить пациента по ID
  async getById(id) {
    const res = await api.get(`/patients/${id}`)
    return res.data
  },

  // Регистрация
  async register(dto) {
    const res = await api.post('/patients/register', dto)
    return res.data
  },

  // Обновление
  async update(id, dto) {
    const res = await api.patch(`/patients/${id}`, dto)
    return res.data
  }
}

// Алиасы — чтобы компоненты могли импортировать напрямую
export function getPatients() {
  return patientsApi.getAll()
}

export function getMyProfile() {
  return patientsApi.getMyProfile()
}

export function getPatientById(id) {
  return patientsApi.getById(id)
}
