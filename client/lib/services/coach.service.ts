import api from '../api';
import { Coach, Package, ApiListResponse, ApiResponse } from '../types';

export const coachService = {
    getAll: async () => {
        const response = await api.get<ApiListResponse<Coach>>('/coaches');
        return response.data;
    },

    createProfile: async (data: { bio: string; experience: string }) => {
        const response = await api.post<ApiResponse<Coach>>('/coaches/profile', data);
        return response.data;
    },

    createPackage: async (data: { name: string; price: number }) => {
        const response = await api.post<ApiResponse<Package>>('/coaches/packages', data);
        return response.data;
    }
};
