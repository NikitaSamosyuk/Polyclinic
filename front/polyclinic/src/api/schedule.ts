import api from './axios'

export async function getSlotsForDoctor(doctorId: number, date: string) {
  try {
    const res = await api.get('/schedule/doctor', {
      params: { doctorId, date },
    })
    return res.data
  } catch (err) {
    // Если врач не работает → возвращаем пустой результат
    if (err?.response?.status === 400) {
      return {
        doctorId,
        date,
        slots: [],
        cabinetId: null,
        message: 'Врач не работает в этот день',
      }
    }
    throw err
  }
}
