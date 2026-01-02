import api from '../api';
import { Product, ApiListResponse, ApiResponse } from '../types';

export const storeService = {
    getProducts: async () => {
        const response = await api.get<ApiListResponse<Product>>('/store/products');
        return response.data;
    },

    createOrder: async (items: { productId: string; quantity: number }[]) => {
        const response = await api.post('/store/orders', { items });
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get('/store/orders');
        return response.data;
    }
};
