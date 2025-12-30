import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // Use environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback: use current host for production
  if (import.meta.env.PROD) {
    return `${window.location.protocol}//${window.location.host}/api/v1`;
  }
  
  // Development fallback
  return 'http://localhost:3000/api/v1';
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('loxan-admin-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
