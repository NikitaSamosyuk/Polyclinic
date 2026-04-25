import api from './axios'

export interface Cabinet {
  id: number
  number: string
  specialization: string
  workingHoursStart: string
  workingHoursEnd: string
  slotDuration: number
  isActive: boolean
  doctors: any[]
  shifts: any[]
}

export async function getCabinets(): Promise<Cabinet[]> {
  const res = await api.get('/cabinets')
  return res.data
}

export async function getCabinet(id: number): Promise<Cabinet> {
  const res = await api.get(`/cabinets/${id}`)
  return res.data
}

export async function createCabinet(data: {
  number: string
  specialization?: string
  workingHoursStart: string
  workingHoursEnd: string
  slotDuration: number
}) {
  const res = await api.post('/cabinets', data)
  return res.data
}

export async function updateCabinet(id: number, data: any) {
  const res = await api.patch(`/cabinets/${id}`, data)
  return res.data
}

export async function deactivateCabinet(id: number) {
  const res = await api.delete(`/cabinets/${id}`)
  return res.data
}
