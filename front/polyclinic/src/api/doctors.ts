import api from './axios'

export const doctorsApi = {
  getPhoto: () => api.get('/doctors/photo'),

  uploadPhoto: (file: File) => {
    const form = new FormData()
    // имя поля должно совпадать с FileInterceptor('photo') на бэке
    form.append('photo', file)

    return api.post('/doctors/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
