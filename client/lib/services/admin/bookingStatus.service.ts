import { adminApi } from "@/lib/api";

export interface BookingStatus {
    id: number;
    name: string;
    color: string;
    description?: string;
    isDefault?: boolean;
    createdAt?: string;
}

export const adminBookingStatusService = {
    getAll: async () => {
        const response = await adminApi.get<{ success: boolean; data: BookingStatus[] }>('/settings/booking-statuses');
        return response.data;
    },

    create: async (data: Partial<BookingStatus>) => {
        const response = await adminApi.post<{ success: boolean; data: BookingStatus }>('/settings/booking-statuses', data);
        return response.data;
    },

    update: async (id: number, data: Partial<BookingStatus>) => {
        const response = await adminApi.put<{ success: boolean; data: BookingStatus }>(`/settings/booking-statuses/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await adminApi.delete<{ success: boolean }>(`/settings/booking-statuses/${id}`);
        return response.data;
    }
};