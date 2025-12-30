import api from '@/api/api';

export const SettingsAPI = {
    getConfig: () => api.get('/settings/config'),
    updateConfig: (data: any) => api.put('/settings/config', data),
    getAnalysis: () => api.get('/settings/analysis'),

    getCategories: (params: any) => api.get('/settings/categories', { params }),
    createCategory: (data: any) => api.post('/settings/categories', data),
    updateCategory: (id: string, data: any) => api.put(`/settings/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/settings/categories/${id}`),
};
