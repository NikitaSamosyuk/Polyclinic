import api from './axios'

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),

  me: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),
}
