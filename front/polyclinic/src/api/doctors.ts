// src/api/doctors.ts
import api from './axios'

export const doctorsApi = {
  // Создать врача (после создания user)
  async create(data: any) {
    const res = await api.post('/doctors', data)
    return res.data
  },

  // Получить врача по userId
  async getByUserId(userId: number) {
    const res = await api.get(`/doctors/user/${userId}`)
    return res.data.doctor ?? res.data
  },

  // Получить врача по doctorId
  async getById(id: number) {
    const res = await api.get(`/doctors/${id}`)
    return res.data.doctor ?? res.data
  },

  // Активные врачи
  async getAllActive() {
    const res = await api.get('/doctors/active')
    return res.data
  },

  // Неактивные врачи
  async getAllInactive() {
    const res = await api.get('/doctors/inactive')
    return res.data
  },

  // Все врачи (активные + неактивные)
  async getAll() {
    const [active, inactive] = await Promise.all([
      this.getAllActive().catch(() => []),
      this.getAllInactive().catch(() => []),
    ])

    const a = Array.isArray(active) ? active : []
    const i = Array.isArray(inactive) ? inactive : []

    return [...a, ...i]
  },

  // Обновить врача
  async update(id: number, data: any) {
    const res = await api.patch(`/doctors/${id}`, data)
    return res.data.doctor ?? res.data
  },

  // Загрузить фото врача
  async uploadPhoto(formData: FormData) {
    const res = await api.post('/doctors/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.doctor ?? res.data
  },

  // Деактивация
  async deactivate(id: number) {
    const res = await api.patch(`/doctors/${id}/deactivate`, {})
    return res.data.doctor ?? res.data
  },

  // Активация
  async activate(id: number) {
    const res = await api.patch(`/doctors/${id}/activate`, {})
    return res.data.doctor ?? res.data
  },
}

// Для публичной страницы врачей
export function getDoctors() {
  return doctorsApi.getAllActive()
}
