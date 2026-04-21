export const AccessMap: Record<string, 'PUBLIC' | string[]> = {
  // --- AUTH ---
  'POST /auth/login': 'PUBLIC',
  'POST /auth/register': 'PUBLIC',
  'POST /auth/refresh': 'PUBLIC',

  'GET /auth/me': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'POST /auth/logout': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- DOCTORS ---
  'GET /doctors': 'PUBLIC',
  'GET /doctors/photo': ['DOCTOR'],
  'POST /doctors/photo': ['DOCTOR', 'ADMIN'],
  'GET /doctors/user/:userId': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- USERS ---
  'GET /users/avatar': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'POST /users/avatar': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- PATIENTS ---
  'GET /patients/me': ['PATIENT'],
  'GET /patients': ['DOCTOR', 'ADMIN'],
  'GET /patients/user/:userId': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- CABINETS ---
  'GET /cabinets': 'PUBLIC',
  'GET /cabinets/:id': 'PUBLIC',
  'POST /cabinets': ['ADMIN'],
  'PATCH /cabinets/:id': ['ADMIN'],
  'DELETE /cabinets/:id': ['ADMIN'],

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

  // мои записи (пациент/врач)
  'GET /appointments': ['PATIENT', 'DOCTOR'],

  // записи врача (только админ)
  'GET /appointments/doctor/:doctorId': ['ADMIN'],

  // все записи (только админ)
  'GET /appointments/all': ['ADMIN'],

  // удалить запись (только админ)
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
};
