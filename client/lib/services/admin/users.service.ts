import { adminApi } from "@/lib/api";

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    isActive: boolean;
    createdAt: string;
    phone?: string;
    image?: string;
    bio?: string;
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
}

export const adminUserService = {
    getAll: async (params?: GetUsersParams) => {
        const response = await adminApi.get<{ success: boolean; data: User[]; count: number }>('/users', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await adminApi.get<{ success: boolean; data: User }>(`/users/${id}`);
        return response.data;
    },

    createUser: async (data: Partial<User>) => {
        const response = await adminApi.post<{ success: boolean; data: User }>('/users', data);
        return response.data;
    },

    updateUser: async (id: number, data: Partial<User>) => {
        const response = await adminApi.put<{ success: boolean; data: User }>(`/users/${id}`, data);
        return response.data;
    },

    banUser: async (id: number) => {
        const response = await adminApi.patch<{ success: boolean; message: string }>(`/users/${id}/ban`);
        return response.data;
    },

    updateRole: async (id: number, role: 'user' | 'admin') => {
        const response = await adminApi.put(`/users/${id}`, { role });
        return response.data;
    },

    deleteUser: async (id: number) => {
        const response = await adminApi.delete(`/users/${id}`);
        return response.data;
    }
};
