import api from '@/api/api';

export const SponsorsAPI = {
    getAllSponsors: (params: any) => api.get('/sponsors', { params }),
    getSponsor: (id: string) => api.get(`/sponsors/${id}`),
    createSponsor: (data: FormData) => api.post('/sponsors', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateSponsor: (id: string, data: FormData) => api.put(`/sponsors/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    deleteSponsor: (id: string) => api.delete(`/sponsors/${id}`),
};
