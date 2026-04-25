import api from './axios'

export interface Shift {
  id: number
  doctorId: number
  cabinetId: number
  date: string | Date
  startTime: string
  endTime: string
}

export async function createShift(data: {
  doctorId: number
  cabinetId: number
  date: string
  startTime: string
  endTime: string
}): Promise<Shift> {
  const res = await api.post('/shifts', data)
  return res.data
}

export async function updateShift(id: number, data: Partial<Shift>): Promise<Shift> {
  const res = await api.patch(`/shifts/${id}`, data)
  return res.data
}

export async function deleteShift(id: number): Promise<void> {
  await api.delete(`/shifts/${id}`)
}
