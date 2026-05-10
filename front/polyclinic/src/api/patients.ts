import api from './axios'

export const patientsApi = {
  async getAllActive() {
    const res = await api.get('/patients')
    return res.data
  },

  async getAllInactive() {
    const res = await api.get('/patients/inactive')
    return res.data
  },

  async getAll() {
    const [active, inactive] = await Promise.all([
      this.getAllActive(),
      this.getAllInactive(),
    ])

    return [...active, ...inactive]
  },

  async getMyProfile() {
    try {
      const res = await api.get('/patients/me')
      return res.data
    } catch (err: any) {
      if (err?.response?.status === 404) return null
      throw err
    }
  },

  me() {
    return this.getMyProfile()
  },

  async getById(id: number) {
    const res = await api.get(`/patients/${id}`)
    return res.data
  },

  async register(dto: any) {
    const res = await api.post('/patients/register', dto)
    return res.data
  },

  async update(id: number, dto: any) {
    const res = await api.patch(`/patients/${id}`, dto)
    return res.data
  },

  async deactivate(id: number) {
    const res = await api.patch(`/patients/${id}/deactivate`)
    return res.data
  },

  async activate(id: number) {
    const res = await api.patch(`/patients/${id}/activate`)
    return res.data
  },
}

export const getPatients = () => patientsApi.getAll()
export const getMyProfile = () => patientsApi.getMyProfile()
export const getPatientById = (id: number) => patientsApi.getById(id)
