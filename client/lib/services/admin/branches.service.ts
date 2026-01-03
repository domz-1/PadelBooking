import { adminApi, api as clientApi } from "@/lib/api";
import type { Branch } from "@/lib/schemas";

export const adminBranchService = {
    getAll: async () => {
        const response = await adminApi.get<Branch[]>('/branches');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await adminApi.get<Branch>(`/branches/${id}`);
        return response.data;
    },

    create: async (data: Partial<Branch>) => {
        const response = await adminApi.post<Branch>('/branches', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Branch>) => {
        const response = await adminApi.put<Branch>(`/branches/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await adminApi.delete<void>(`/branches/${id}`);
        return response.data;
    }
};

export const clientBranchService = {
    getAll: async () => {
        const response = await clientApi.get<Branch[]>('/branches');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await clientApi.get<Branch>(`/branches/${id}`);
        return response.data;
    }
};
