import api from '../api';
import { User, ApiListResponse, ApiResponse } from '../types';

export const userService = {
    getById: async (id: string) => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data;
    },

    updateProfile: async (data: Partial<User>) => {
        const response = await api.put<ApiResponse<User>>('/users/profile', data);
        return response.data;
    },

    updatePassword: async (data: { currentPassword: string; newPassword: string }) => {
        const response = await api.put('/users/password', data);
        return response.data;
    },

    findPartners: async (params?: { level?: string; region?: string; page?: number; limit?: number }) => {
        const response = await api.get<ApiListResponse<User>>('/users/partners', { params });
        return response.data;
    }
};
