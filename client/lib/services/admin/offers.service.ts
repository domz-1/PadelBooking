import { adminApi } from "@/lib/api";
import { Offer } from "../offer.service";
export type { Offer };

export const adminOfferService = {
    getAll: async (params?: { page?: number; limit?: number }) => {
        const response = await adminApi.get<{ success: boolean; data: Offer[]; count: number }>('/offers', { params });
        return response.data;
    },

    create: async (data: { title: string; description: string; discountPercentage: number; validUntil: string; image?: string }) => {
        const response = await adminApi.post<{ success: boolean; data: Offer }>('/offers', data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await adminApi.delete(`/offers/${id}`);
        return response.data;
    }
};
