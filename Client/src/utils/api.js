// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '/api'; // Pointe vers api-gateway

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Pour les cookies, si utilisé
});

// Interceptor pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion des erreurs globales (ex. 401 pour déconnexion)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Déconnexion automatique
      localStorage.clear();
      window.location.href = '/login'; // Redirige vers login
    }
    return Promise.reject(error);
  }
);

export default api;