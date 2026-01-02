import api from '../api';
import { Sponsor, ApiListResponse, ApiResponse } from '../types';

export const sponsorService = {
    getSponsors: async () => {
        const response = await api.get<ApiListResponse<Sponsor>>('/sponsors');
        return response.data;
    },

    getSponsor: async (id: number) => {
        const response = await api.get<ApiResponse<Sponsor>>(`/sponsors/${id}`);
        return response.data;
    },

    createSponsor: async (formData: FormData) => {
        const response = await api.post<ApiResponse<Sponsor>>('/sponsors', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateSponsor: async (id: number, formData: FormData) => {
        const response = await api.put<ApiResponse<Sponsor>>(`/sponsors/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteSponsor: async (id: number) => {
        const response = await api.delete(`/sponsors/${id}`);
        return response.data;
    }
};
