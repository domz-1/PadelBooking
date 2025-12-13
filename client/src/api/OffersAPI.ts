import api from '@/api/api';

export const OffersAPI = {
    getAllOffers: (params: any) => api.get('/offers', { params }),
    createOffer: (data: any) => api.post('/offers', data),
    deleteOffer: (id: string) => api.delete(`/offers/${id}`),
};
