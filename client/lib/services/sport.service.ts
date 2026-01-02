import api from '../api';
import { Sport, ApiListResponse, ApiResponse } from '../types';

export const sportService = {
    getSports: async () => {
        const response = await api.get<ApiListResponse<Sport>>('/sports');
        return response.data;
    },

    getSport: async (id: string) => {
        const response = await api.get<ApiResponse<Sport>>(`/sports/${id}`);
        return response.data;
    },

    createSport: async (data: { name: string }) => {
        const response = await api.post<ApiResponse<Sport>>('/sports', data);
        return response.data;
    },

    updateSport: async (id: string, data: { name: string }) => {
        const response = await api.put<ApiResponse<Sport>>(`/sports/${id}`, data);
        return response.data;
    },

    deleteSport: async (id: string) => {
        const response = await api.delete(`/sports/${id}`);
        return response.data;
    }
};
