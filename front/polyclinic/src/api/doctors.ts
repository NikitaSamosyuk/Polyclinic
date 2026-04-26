import api from './axios'

export const doctorsApi = {
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

  // Получить всех врачей
  async getAll() {
    const res = await api.get('/doctors')
    return res.data
  },

  // Обновить данные врача (ФИО)
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
}

// Алиас
export function getDoctors() {
  return doctorsApi.getAll()
}
