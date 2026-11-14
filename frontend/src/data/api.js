import axios from 'axios';

// Base Axios instance configured for USMS API
export const apiClient = axios.create({
  baseURL: '/',
  timeout: 5000,
});

export const SitesAPI = {
  getAll: () => apiClient.get('/sites').catch(() => apiClient.get('/api/sites')),
  getById: (id) => apiClient.get(`/sites/${id}`).catch(() => apiClient.get(`/api/sites/${id}`)),
  create: (data) => apiClient.post('/sites', data).catch(() => apiClient.post('/api/sites', data)),
  update: (id, data) => apiClient.put(`/sites/${id}`, data).catch(() => apiClient.put(`/api/sites/${id}`, data)),
  delete: (id) => apiClient.delete(`/sites/${id}`).catch(() => apiClient.delete(`/api/sites/${id}`)),
};

export const SurveysAPI = {
  getAll: () => apiClient.get('/surveys').catch(() => apiClient.get('/api/surveys')),
  getById: (id) => apiClient.get(`/surveys/${id}`).catch(() => apiClient.get(`/api/surveys/${id}`)),
  create: (data) => apiClient.post('/surveys', data).catch(() => apiClient.post('/api/surveys', data)),
  update: (id, data) => apiClient.put(`/surveys/${id}`, data).catch(() => apiClient.put(`/api/surveys/${id}`, data)),
  delete: (id) => apiClient.delete(`/surveys/${id}`).catch(() => apiClient.delete(`/api/surveys/${id}`)),
};

export const ReportsAPI = {
  getAll: () => apiClient.get('/reports').catch(() => apiClient.get('/api/reports')),
  getById: (id) => apiClient.get(`/reports/${id}`).catch(() => apiClient.get(`/api/reports/${id}`)),
  create: (data) => apiClient.post('/reports', data).catch(() => apiClient.post('/api/reports', data)),
  update: (id, data) => apiClient.put(`/reports/${id}`, data).catch(() => apiClient.put(`/api/reports/${id}`, data)),
  delete: (id) => apiClient.delete(`/reports/${id}`).catch(() => apiClient.delete(`/api/reports/${id}`)),
};

export const InvestigationsAPI = {
  getAll: () => apiClient.get('/investigations').catch(() => apiClient.get('/api/investigations')),
  getById: (id) => apiClient.get(`/investigations/${id}`).catch(() => apiClient.get(`/api/investigations/${id}`)),
  create: (data) => apiClient.post('/investigations', data).catch(() => apiClient.post('/api/investigations', data)),
  update: (id, data) => apiClient.put(`/investigations/${id}`, data).catch(() => apiClient.put(`/api/investigations/${id}`, data)),
  delete: (id) => apiClient.delete(`/investigations/${id}`).catch(() => apiClient.delete(`/api/investigations/${id}`)),
};
