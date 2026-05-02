import api from './axios'

export const visitsApi = {
  async getAll() {
    const res = await api.get('/visits')
    return res.data
  },

  async getMy() {
    const res = await api.get('/visits/my')
    return res.data
  },

  async getById(id: number) {
    const res = await api.get(`/visits/${id}`)
    return res.data
  },

  async create(dto: any) {
    const res = await api.post('/visits', dto)
    return res.data
  },

  async update(id: number, dto: any) {
    const res = await api.patch(`/visits/${id}`, dto)
    return res.data
  },

  async delete(id: number) {
    const res = await api.delete(`/visits/${id}`)
    return res.data
  }
}

/* ---------------- УДОБНЫЕ ФУНКЦИИ ---------------- */

export function getVisits() {
  return visitsApi.getAll()
}

export function getMyVisits() {
  return visitsApi.getMy()
}

export function getVisitById(id: number) {
  return visitsApi.getById(id)
}

export function createVisit(dto: any) {
  return visitsApi.create(dto)
}

export function updateVisit(id: number, dto: any) {
  return visitsApi.update(id, dto)
}

export function deleteVisit(id: number) {
  return visitsApi.delete(id)
}
