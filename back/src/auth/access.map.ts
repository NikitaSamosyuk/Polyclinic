export const AccessMap: Record<string, 'PUBLIC' | string[]> = {
  // --- AUTH ---
  'POST /auth/login': 'PUBLIC',
  'POST /auth/register': 'PUBLIC',
  'POST /auth/refresh': 'PUBLIC',
  'GET /auth/me': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'POST /auth/logout': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- DOCTORS ---
  'GET /doctors/active': ['ADMIN', 'DOCTOR', 'PATIENT'], // публичный список активных врачей
  'GET /doctors/inactive': ['ADMIN'], // только админ

  'GET /doctors/:id': 'PUBLIC',
  'GET /doctors/user/:userId': ['PATIENT', 'DOCTOR', 'ADMIN'],

  'GET /doctors/photo': ['DOCTOR'],
  'POST /doctors/photo': ['DOCTOR', 'ADMIN'],

  'POST /doctors': ['ADMIN'],
  'PATCH /doctors/:id': ['ADMIN', 'DOCTOR'],

  // деактивация / активация врача
  'PATCH /doctors/:id/deactivate': ['ADMIN'],
  'PATCH /doctors/:id/activate': ['ADMIN'],

  // --- USERS ---
  'GET /users/avatar': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'POST /users/avatar': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'PATCH /users': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'PATCH /users/password': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'POST /users/doctor': ['ADMIN'],

  // --- PATIENTS ---
  'POST /patients/register': ['PATIENT'],
  'GET /patients/me': ['PATIENT'],

  'GET /patients': ['DOCTOR', 'ADMIN'],
  'GET /patients/:id': ['DOCTOR', 'ADMIN'],

  'PATCH /patients/:id': ['PATIENT', 'ADMIN'],

  // деактивация / активация пациента
  'PATCH /patients/:id/deactivate': ['ADMIN'],
  'PATCH /patients/:id/activate': ['ADMIN'],

  'GET /patients/search/query': ['DOCTOR', 'ADMIN'],

  // --- CABINETS ---
  'GET /cabinets': 'PUBLIC',
  'GET /cabinets/:id': 'PUBLIC',
  'POST /cabinets': ['ADMIN'],
  'PATCH /cabinets/:id': ['ADMIN'],
  'DELETE /cabinets/:id': ['ADMIN'],

  // --- SHIFTS ---
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
  'GET /therapist-zones/by-doctor/:doctorId': ['ADMIN', 'DOCTOR'],
  'POST /therapist-zones': ['ADMIN'],
  'PATCH /therapist-zones/:id': ['ADMIN'],
  'DELETE /therapist-zones/:id': ['ADMIN'],

  // --- APPOINTMENTS ---
  'POST /appointments': ['PATIENT', 'ADMIN'],
  'POST /appointments/slot': ['PATIENT'],
  'GET /appointments/my': ['PATIENT', 'DOCTOR'],
  'GET /appointments': ['ADMIN'],
  'GET /appointments/doctor/:doctorId': ['ADMIN'],
  'GET /appointments/all': ['ADMIN'],
  'DELETE /appointments/my/:id': ['PATIENT'],
  'DELETE /appointments/:id': ['ADMIN'],

  // --- VISITS ---
  'POST /visits': ['DOCTOR', 'ADMIN'],
  'PATCH /visits/:id': ['DOCTOR', 'ADMIN'],
  'DELETE /visits/:id': ['DOCTOR', 'ADMIN'],
  'GET /visits': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'GET /visits/:id': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- VISIT FILES ---
  'POST /visit-files/:visitId': ['DOCTOR', 'ADMIN'],
  'GET /visit-files/:visitId': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'DELETE /visit-files/file/:fileId': ['DOCTOR', 'ADMIN'],
};
