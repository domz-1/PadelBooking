import api from '@/api/api';

export const CoachesAPI = {
    getAllCoaches: (params: any) => api.get('/coaches', { params }),
    createProfile: (data: any) => api.post('/coaches/profile', data),
    createPackage: (data: any) => api.post('/coaches/packages', data),
    // Assuming these exist or will be needed for full CRUD
    getCoach: (id: string) => api.get(`/coaches/${id}`),
    updateCoach: (id: string, data: any) => api.put(`/coaches/${id}`, data),
    deleteCoach: (id: string) => api.delete(`/coaches/${id}`),
};
