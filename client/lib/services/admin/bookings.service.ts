import { adminApi } from "@/lib/api";
import type { Booking } from "@/lib/schemas";

export interface GetBookingsParams {
    page?: number;
    limit?: number;
    date?: string;
    userId?: number | string;
}

export const adminBookingService = {
    getAll: async (params?: GetBookingsParams) => {
        const response = await adminApi.get<{ success: boolean; data: Booking[]; count: number }>('/bookings', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await adminApi.get<{ success: boolean; data: Booking }>(`/bookings/${id}`);
        return response.data;
    },

    deleteBooking: async (id: number) => {
        const response = await adminApi.delete(`/bookings/${id}`);
        return response.data;
    },

    importBookings: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'bookings');
        const response = await adminApi.post<{ success: boolean; message: string }>('/bookings/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }
};
