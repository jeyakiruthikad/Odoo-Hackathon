import axios from 'axios'

// This project currently runs on the in-memory/localStorage data layer in
// src/context/DataContext.jsx so the UI is fully demoable without a backend.
// When the Express + MongoDB API is ready, point this at it and swap the
// DataContext functions to call these endpoints instead of local state.

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('transitops_token')
  if (user) config.headers.Authorization = `Bearer ${user}`
  return config
})

export const endpoints = {
  login: (data) => api.post('/auth/login', data),
  vehicles: () => api.get('/vehicles'),
  createVehicle: (data) => api.post('/vehicles', data),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),
  drivers: () => api.get('/drivers'),
  createDriver: (data) => api.post('/drivers', data),
  updateDriver: (id, data) => api.put(`/drivers/${id}`, data),
  deleteDriver: (id) => api.delete(`/drivers/${id}`),
  trips: () => api.get('/trips'),
  createTrip: (data) => api.post('/trips', data),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data),
  maintenance: () => api.get('/maintenance'),
  createMaintenance: (data) => api.post('/maintenance', data),
  fuel: () => api.get('/fuel'),
  createFuel: (data) => api.post('/fuel', data),
  expenses: () => api.get('/expenses'),
  createExpense: (data) => api.post('/expenses', data),
}
