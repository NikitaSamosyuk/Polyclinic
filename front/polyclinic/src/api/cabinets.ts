import api from './axios'

export const cabinetsApi = {
  getAll() {
    return api.get('/cabinets').then(r => r.data)
  },

  getById(id) {
    return api.get(`/cabinets/${id}`).then(r => r.data)
  },
}
