import axios, { AxiosInstance } from 'axios';

// API Configuration
export const API_BASE_URL = 'http://localhost:4000';

// Helper to setup interceptors
const setupInterceptors = (instance: AxiosInstance) => {
    instance.interceptors.request.use((config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    });

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // Only redirect if not already on login page
                    if (window.location.pathname !== '/auth/login') {
                        window.location.href = '/auth/login';
                    }
                }
            }
            return Promise.reject(error);
        }
    );
};

// Client API (for /api routes)
export const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
});

// Admin API (for /admin routes)
export const adminApi = axios.create({
    baseURL: `${API_BASE_URL}/admin`,
    headers: { 'Content-Type': 'application/json' },
});

setupInterceptors(api);
setupInterceptors(adminApi);

export default api;
