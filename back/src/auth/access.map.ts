export const AccessMap: Record<string, 'PUBLIC' | string[]> = {
  // --- AUTH ---
  'POST /auth/login': 'PUBLIC',
  'POST /auth/register': 'PUBLIC',
  'POST /auth/refresh': 'PUBLIC',

  'GET /auth/me': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'POST /auth/logout': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- DOCTORS ---
  'GET /doctors': 'PUBLIC',
  'GET /doctors/photo': ['DOCTOR'], // исправлено
  'POST /doctors/photo': ['DOCTOR', 'ADMIN'],

  // --- USERS ---
  'GET /users/avatar': ['PATIENT', 'DOCTOR', 'ADMIN'],
  'POST /users/avatar': ['PATIENT', 'DOCTOR', 'ADMIN'],

  // --- APPOINTMENTS ---
  'POST /appointments': ['PATIENT'],
  'GET /appointments': ['PATIENT', 'DOCTOR'],

  // --- ADMIN ---
  'DELETE /doctors/:id': ['ADMIN'],
};
