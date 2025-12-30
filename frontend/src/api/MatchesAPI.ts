import api from '@/api/api';

export const MatchesAPI = {
    getOpenMatches: (params: any) => api.get('/matches', { params }),
    createMatch: (data: any) => api.post('/matches', data),
    joinMatch: (id: string) => api.post(`/matches/${id}/join`),
    handleRequest: (requestId: string, status: string) => api.put(`/matches/requests/${requestId}`, { status }),
    // Assuming these exist or will be needed for full CRUD
    getMatch: (id: string) => api.get(`/matches/${id}`),
    updateMatch: (id: string, data: any) => api.put(`/matches/${id}`, data),
    deleteMatch: (id: string) => api.delete(`/matches/${id}`),
};
