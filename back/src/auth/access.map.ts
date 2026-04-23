export const AccessMap: Record<string, 'PUBLIC' | string[]> = {
  // --- AUTH ---
  'POST /auth/login': 'PUBLIC',
  'POST /auth/register': 'PUBLIC',
  'POST /auth/refresh': 'PUBLIC',
  'GET /auth/me': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'POST /auth/logout': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- DOCTORS ---
  'GET /doctors': 'PUBLIC', // публичный список врачей
  'GET /doctors/:id': 'PUBLIC', // публичная карточка врача
  'GET /doctors/user/:userId': ['PATIENT', 'DOCTOR', 'ADMIN'], // врач по userId
  'GET /doctors/photo': ['DOCTOR'], // фото врача
  'POST /doctors/photo': ['DOCTOR', 'ADMIN'], // загрузка фото
  'POST /doctors': ['ADMIN'], // создание врача
  'PATCH /doctors/:id': ['ADMIN'], // обновление врача
  'DELETE /doctors/:id': ['ADMIN'], // деактивация врача
  'GET /doctors/:id/patients': ['DOCTOR', 'ADMIN'], // пациенты врача
  'GET /doctors/:id/zones': ['DOCTOR', 'ADMIN'], // зоны терапевта

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
