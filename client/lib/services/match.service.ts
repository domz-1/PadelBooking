import api from '../api';
import { Match, ApiListResponse, ApiResponse } from '../types';

export const matchService = {
    getOpenMatches: async () => {
        const response = await api.get<ApiListResponse<Match>>('/matches');
        return response.data;
    },

    createMatch: async (data: { venueId: string; date: string; startTime: string }) => {
        const response = await api.post<ApiResponse<Match>>('/matches', data);
        return response.data;
    },

    joinMatch: async (id: string | number) => {
        const response = await api.post(`/matches/${id}/join`);
        return response.data;
    },

    handleRequest: async (requestId: string, status: 'accepted' | 'rejected') => {
        const response = await api.put(`/matches/requests/${requestId}`, { status });
        return response.data;
    }
};
