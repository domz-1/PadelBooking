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
    }
};
