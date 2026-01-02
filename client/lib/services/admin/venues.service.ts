import { adminApi } from "@/lib/api";

export interface Venue {
    id: number;
    name: string;
    location: string;
    courts: number;
    pricePerHour: number;
    contactEmail: string;
    contactPhone: string;
    description?: string;
    amenities?: string[];
}

export interface GetVenuesParams {
    page?: number;
    limit?: number;
    search?: string;
}

export const adminVenueService = {
    getAll: async (params?: GetVenuesParams) => {
        const response = await adminApi.get<{ success: boolean; data: Venue[]; count: number }>('/venues', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await adminApi.get<{ success: boolean; data: Venue }>(`/venues/${id}`);
        return response.data;
    },

    create: async (data: Partial<Venue>) => {
        const response = await adminApi.post<{ success: boolean; data: Venue }>('/venues', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Venue>) => {
        const response = await adminApi.put<{ success: boolean; data: Venue }>(`/venues/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await adminApi.delete(`/venues/${id}`);
        return response.data;
    }
};
