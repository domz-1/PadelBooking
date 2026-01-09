import { adminApi } from "@/lib/api";

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    isActive: boolean;
    isGuest: boolean;
    createdAt: string;
    phone?: string;
    image?: string;
    bio?: string;
    password?: string;
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isGuest?: boolean;
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

    updateUser: async (id: number, data: Partial<User> | FormData) => {
        const config = data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {};
        // @ts-ignore - Content-Type undefined is valid for letting browser set it
        const response = await adminApi.put<{ success: boolean; data: User }>(`/users/${id}`, data, config);
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
    },

    importUsers: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'users');
        // Note: Reusing the bookings endpoint which actually handles generic imports or specific endpoint?
        // Implementation plan said import.controller handles both types.
        // Let's assume we exposed it under /users/import or centralized import.
        // Actually, in backend I added import route to bookings routes... reusing that for simplicity or moving it.
        // Plan: "Add routes for import" -> "bookings.admin.routes.js" had the import route. 
        // Let's use that endpoint but maybe refactor later. Ideally should be /admin/import
        // For now, I'll call the same endpoint as bookings service but with type='users' if the backend allows it.
        // Looking at backend code: importController checks req.body.type.
        // And the route is mounted at /admin/bookings/import.
        // So yes, we call that.
        const response = await adminApi.post<{ success: boolean; message: string }>('/bookings/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }
};
