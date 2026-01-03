import { adminApi, api as clientApi } from '../api';
import { Sponsor, ApiListResponse, ApiResponse } from '../types';

export const sponsorService = {
    getSponsors: async () => {
        const response = await clientApi.get<ApiListResponse<Sponsor>>('/sponsors');
        return response.data;
    },

    getSponsor: async (id: number) => {
        const response = await clientApi.get<ApiResponse<Sponsor>>(`/sponsors/${id}`);
        return response.data;
    },

    createSponsor: async (formData: FormData) => {
        const response = await adminApi.post<ApiResponse<Sponsor>>('/sponsors', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateSponsor: async (id: number, formData: FormData) => {
        const response = await adminApi.put<ApiResponse<Sponsor>>(`/sponsors/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteSponsor: async (id: number) => {
        const response = await adminApi.delete(`/sponsors/${id}`);
        return response.data;
    }
};
