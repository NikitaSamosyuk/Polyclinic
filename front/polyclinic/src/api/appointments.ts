import api from './axios'

export const appointmentsApi = {
  // Все записи (только админ)
  getAll() {
    return api.get('/appointments/all').then(res => res.data)
  },

  // Мои записи (доктор или пациент)
  getMy() {
    return api.get('/appointments/my').then(res => res.data)
  },

  // Записи конкретного врача
  getByDoctorId(id) {
    return api.get(`/appointments/doctor/${id}`).then(res => res.data)
  },

  // Записи конкретного пациента
  getByPatientId(id) {
    return api.get(`/appointments/patient/${id}`).then(res => res.data)
  },

  // Создать запись (пациент)
  create(data) {
    return api.post('/appointments', data).then(res => res.data)
  },

  // Обновить запись (админ)
  update(id, data) {
    return api.patch(`/appointments/${id}`, data).then(res => res.data)
  },

  // Удалить запись (админ)
  delete(id) {
    return api.delete(`/appointments/${id}`).then(res => res.data)
  },
}

// Алиасы
export function getMyAppointments() {
  return appointmentsApi.getMy()
}

export function getAllAppointments() {
  return appointmentsApi.getAll()
}

export function getAppointmentsByDoctor(id) {
  return appointmentsApi.getByDoctorId(id)
}

export function getAppointmentsByPatient(id) {
  return appointmentsApi.getByPatientId(id)
}

export function createAppointment(data) {
  return appointmentsApi.create(data)
}

export function updateAppointment(id, data) {
  return appointmentsApi.update(id, data)
}

export function deleteAppointment(id) {
  return appointmentsApi.delete(id)
}
