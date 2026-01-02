import api from '../api';
import { Venue, ApiListResponse, ApiResponse } from '../types';

export const venueService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const response = await api.get<ApiListResponse<Venue>>('/venues', { params });
        return response.data;
    },

    getById: async (id: string | number) => {
        const response = await api.get<ApiResponse<Venue>>(`/venues/${id}`);
        return response.data;
    },

    create: async (data: Partial<Venue>) => {
        const response = await api.post<ApiResponse<Venue>>('/venues', data);
        return response.data;
    },

    update: async (id: string | number, data: Partial<Venue>) => {
        const response = await api.put<ApiResponse<Venue>>(`/venues/${id}`, data);
        return response.data;
    },

    delete: async (id: string | number) => {
        const response = await api.delete(`/venues/${id}`);
        return response.data;
    }
};
