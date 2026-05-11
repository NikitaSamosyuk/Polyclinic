// src/api/visits.ts
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
  },
}

/* ---------------- УДОБНЫЕ ФУНКЦИИ ---------------- */

export const getVisits = () => visitsApi.getAll()
export const getMyVisits = () => visitsApi.getMy()
export const getVisitById = (id: number) => visitsApi.getById(id)
export const createVisit = (dto: any) => visitsApi.create(dto)
export const updateVisit = (id: number, dto: any) => visitsApi.update(id, dto)
export const deleteVisit = (id: number) => visitsApi.delete(id)

/* ---------------- ФАЙЛЫ ВИЗИТА ---------------- */

export const visitFilesApi = {
  async getByVisit(visitId: number) {
    const res = await api.get(`/visit-files/${visitId}`)
    return res.data
  },

  async upload(visitId: number, file: File) {
    const form = new FormData()
    form.append('file', file)

    const res = await api.post(`/visit-files/${visitId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return res.data
  },

  async delete(fileId: number) {
    const res = await api.delete(`/visit-files/file/${fileId}`)
    return res.data
  },
}
