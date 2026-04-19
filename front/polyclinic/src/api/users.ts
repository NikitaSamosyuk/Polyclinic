import api from './axios'

export const usersApi = {
  // аватар профиля
  getAvatar: () => api.get('/users/avatar'),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    // имя поля должно совпадать с FileInterceptor('avatar') на бэке
    form.append('avatar', file)

    return api.post('/users/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // пациент "я"
  getMePatient: () => api.get('/patients/me'),
}
