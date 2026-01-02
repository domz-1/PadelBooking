import { adminApi, api } from "@/lib/api";

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
}

export interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    User?: { name: string };
    OrderItems?: any[];
}

export const adminStoreService = {
    // Products (Using Client API mostly for listing)
    getProducts: async (params?: { page?: number; limit?: number; type?: string }) => {
        // Use client API to fetch products list
        const response = await api.get('/store/products', { params });
        return response.data;
    },

    getOrders: async (params?: { page?: number; limit?: number }) => {
        const response = await adminApi.get<{ success: boolean; data: Order[]; count: number }>('/store/orders', { params });
        return response.data;
    },

    updateOrderStatus: async (id: number, status: string) => {
        const response = await adminApi.put<{ success: boolean; data: Order }>(`/store/orders/${id}`, { status });
        return response.data;
    },

    // Product Management
    createProduct: async (data: Partial<Product>) => {
        const response = await adminApi.post<{ success: boolean; data: Product }>('/store/products', data);
        return response.data;
    },

    updateProduct: async (id: number, data: Partial<Product>) => {
        const response = await adminApi.put<{ success: boolean; data: Product }>(`/store/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: number) => {
        const response = await adminApi.delete(`/store/products/${id}`);
        return response.data;
    }
};
