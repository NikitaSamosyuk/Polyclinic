// src/api/users.ts
import api from './axios'

export const usersApi = {
  // Аватар
  getAvatar() {
    return api.get('/users/avatar')
  },

  uploadAvatar(file: File) {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/users/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Профиль пользователя
  updateProfile(payload: { username?: string; email?: string }) {
    return api.patch('/users', payload)
  },

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return api.patch('/users/password', payload)
  },

  // Текущий пациент
  getMePatient() {
    return api.get('/patients/me')
  },

  // 🔥 СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ ДЛЯ ВРАЧА
  createDoctorUser(payload: { username: string; email: string; password: string }) {
    return api.post('/users/doctor', payload)
  },
}
