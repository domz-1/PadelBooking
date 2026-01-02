import api from '../api';
import { ApiListResponse } from '../types';

export interface Offer {
    id: number;
    title: string;
    description: string;
    image?: string;
    validUntil: string;
    discountPercentage: number;
    createdAt: string;
}

export const offerService = {
    getOffers: async () => {
        const response = await api.get<ApiListResponse<Offer>>('/offers');
        return response.data;
    }
};
