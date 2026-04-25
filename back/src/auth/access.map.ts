export const AccessMap: Record<string, 'PUBLIC' | string[]> = {
  // --- AUTH ---
  'POST /auth/login': 'PUBLIC',
  'POST /auth/register': 'PUBLIC',
  'POST /auth/refresh': 'PUBLIC',
  'GET /auth/me': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'POST /auth/logout': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- DOCTORS ---
  'GET /doctors': 'PUBLIC',
  'GET /doctors/:id': 'PUBLIC',
  'GET /doctors/user/:userId': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'GET /doctors/photo': ['DOCTOR'],
  'POST /doctors/photo': ['DOCTOR', 'ADMIN'],
  'POST /doctors': ['ADMIN'],
  'PATCH /doctors/:id': ['ADMIN'],
  'DELETE /doctors/:id': ['ADMIN'],
  'GET /doctors/:id/patients': ['DOCTOR', 'ADMIN'],
  'GET /doctors/:id/zones': ['DOCTOR', 'ADMIN'],
  'POST /doctors/:id/schedule/refresh': ['ADMIN'],

  // --- USERS ---
  'GET /users/avatar': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'POST /users/avatar': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'PATCH /users': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'PATCH /users/password': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- PATIENTS ---
  'POST /patients/register': ['PATIENT'],
  'GET /patients/me': ['PATIENT'],
  'GET /patients': ['DOCTOR', 'ADMIN'],
  'GET /patients/:id': ['DOCTOR', 'ADMIN'],
  'PATCH /patients/:id': ['PATIENT', 'ADMIN'],
  'DELETE /patients/:id': ['ADMIN'],
  'GET /patients/search/query': ['DOCTOR', 'ADMIN'],

  // --- CABINETS ---
  'GET /cabinets': 'PUBLIC',
  'GET /cabinets/:id': 'PUBLIC',
  'POST /cabinets': ['ADMIN'],
  'PATCH /cabinets/:id': ['ADMIN'],
  'DELETE /cabinets/:id': ['ADMIN'],

  // --- SHIFTS (НОВЫЙ МОДУЛЬ) ---
  'GET /shifts': ['DOCTOR', 'ADMIN'],
  'GET /shifts/:id': ['DOCTOR', 'ADMIN'],
  'POST /shifts': ['ADMIN'],
  'PATCH /shifts/:id': ['ADMIN'],
  'DELETE /shifts/:id': ['ADMIN'],

  // --- SCHEDULE ---
  'GET /schedule/doctor': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'GET /schedule/therapist/nearest': ['PATIENT'],
  'GET /schedule/therapists': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- THERAPIST-ZONES ---
  'GET /therapist-zones': ['ADMIN', 'DOCTOR'],
  'GET /therapist-zones/doctor/:doctorId': ['ADMIN', 'DOCTOR'],
  'POST /therapist-zones': ['ADMIN'],
  'PATCH /therapist-zones/:id': ['ADMIN'],
  'DELETE /therapist-zones/:id': ['ADMIN'],

  // --- APPOINTMENTS ---
  'POST /appointments/slot': ['PATIENT'],
  'GET /appointments': ['PATIENT', 'DOCTOR'],
  'GET /appointments/doctor/:doctorId': ['ADMIN'],
  'GET /appointments/all': ['ADMIN'],
  'DELETE /appointments/:id': ['ADMIN'],

  // --- VISITS ---
  'POST /visits': ['DOCTOR'],
  'PATCH /visits/:id': ['DOCTOR'],
  'GET /visits': ['PATIENT', 'DOCTOR'],
  'GET /visits/:id': ['PATIENT', 'DOCTOR'],

  // --- VISIT FILES ---
  'POST /visit-files/:visitId': ['DOCTOR'],
  'GET /visit-files/:visitId': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'DELETE /visit-files/file/:fileId': ['DOCTOR', 'ADMIN'],
}
