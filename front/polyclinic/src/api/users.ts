// src/api/users.ts
import api from './axios'

export const usersApi = {
  getAvatar: () => api.get('/users/avatar'),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/users/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  updateProfile: (payload: { username?: string; email?: string }) => {
    return api.patch('/users', payload)
  },

  // ✔ отправляем оба поля, как требует backend
  changePassword: (payload: { currentPassword: string; newPassword: string }) => {
    return api.patch('/users/password', payload)
  },

  getMePatient: () => api.get('/patients/me'),
}
