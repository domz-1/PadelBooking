import api from '@/api/api';

export const VenuesAPI = {
    getAllVenues: (params: any) => api.get('/venues', { params }),
    getVenue: (id: string) => api.get(`/venues/${id}`),
    createVenue: (data: any) => api.post('/venues', data),
    updateVenue: (id: string, data: any) => api.put(`/venues/${id}`, data),
    deleteVenue: (id: string) => api.delete(`/venues/${id}`),
};
