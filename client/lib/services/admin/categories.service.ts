import { adminApi } from "@/lib/api";

export interface Category {
    id: number;
    name: string;
    color: string;
    description?: string;
    createdAt?: string;
}

export const adminCategoryService = {
    getAll: async () => {
        const response = await adminApi.get<{ success: boolean; data: Category[] }>('/settings/categories');
        return response.data;
    },

    create: async (data: Partial<Category>) => {
        const response = await adminApi.post<{ success: boolean; data: Category }>('/settings/categories', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Category>) => {
        const response = await adminApi.put<{ success: boolean; data: Category }>(`/settings/categories/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await adminApi.delete<{ success: boolean }>(`/settings/categories/${id}`);
        return response.data;
    }
};
