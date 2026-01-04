import api from '../api';
import { ApiListResponse, ApiResponse } from '../types';

export const settingsService = {
    getConfig: async () => {
        const response = await api.get('/settings/config');
        return response.data;
    },

    updateConfig: async (data: Record<string, unknown>) => {
        const response = await api.put('/settings/config', data);
        return response.data;
    },

    getAnalysis: async () => {
        const response = await api.get('/settings/analysis');
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/settings/categories');
        return response.data;
    },

    createCategory: async (data: { name: string }) => {
        const response = await api.post('/settings/categories', data);
        return response.data;
    },

    updateCategory: async (id: string, data: { name: string }) => {
        const response = await api.put(`/settings/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: string) => {
        const response = await api.delete(`/settings/categories/${id}`);
        return response.data;
    },

    // Booking Statuses
    getBookingStatuses: async () => {
        const response = await api.get('/settings/booking-statuses');
        return response.data;
    },

    createBookingStatus: async (data: { name: string; color: string; description?: string }) => {
        const response = await api.post('/settings/booking-statuses', data);
        return response.data;
    },

    updateBookingStatus: async (id: string, data: { name?: string; color?: string; description?: string }) => {
        const response = await api.put(`/settings/booking-statuses/${id}`, data);
        return response.data;
    },

    deleteBookingStatus: async (id: string) => {
        const response = await api.delete(`/settings/booking-statuses/${id}`);
        return response.data;
    }
};
