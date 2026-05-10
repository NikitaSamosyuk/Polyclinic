import api from './axios'

export interface Cabinet {
  id: number
  number: string
  floor: number | null
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
  floor?: number | null
  specialization?: string
  workingHoursStart: string
  workingHoursEnd: string
  slotDuration: number
}) {
  const clean = {
    number: data.number,
    floor: data.floor ?? null,
    specialization: data.specialization,
    workingHoursStart: data.workingHoursStart,
    workingHoursEnd: data.workingHoursEnd,
    slotDuration: data.slotDuration,
  }

  const res = await api.post('/cabinets', clean)
  return res.data
}

export interface UpdateCabinetPayload {
  number?: string
  floor?: number | null
  specialization?: string
  workingHoursStart?: string
  workingHoursEnd?: string
  slotDuration?: number
  isActive?: boolean
}

export async function updateCabinet(id: number, data: UpdateCabinetPayload) {
  const clean: UpdateCabinetPayload = {
    number: data.number,
    floor: data.floor,
    specialization: data.specialization,
    workingHoursStart: data.workingHoursStart,
    workingHoursEnd: data.workingHoursEnd,
    slotDuration: data.slotDuration,
    isActive: data.isActive,
  }

  const res = await api.patch(`/cabinets/${id}`, clean)
  return res.data
}

export async function deactivateCabinet(id: number) {
  const res = await api.delete(`/cabinets/${id}`)
  return res.data
}

export const cabinetsApi = {
  getAll: getCabinets,
  getById: getCabinet,
  create: createCabinet,
  update: updateCabinet,
  deactivate: deactivateCabinet,
}
