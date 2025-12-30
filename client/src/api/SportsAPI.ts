import api from '@/api/api';

export const SportsAPI = {
    getAllSports: (params: any) => api.get('/sports', { params }),
    getSport: (id: string) => api.get(`/sports/${id}`),
    createSport: (data: any) => api.post('/sports', data),
    updateSport: (id: string, data: any) => api.put(`/sports/${id}`, data),
    deleteSport: (id: string) => api.delete(`/sports/${id}`),
};
