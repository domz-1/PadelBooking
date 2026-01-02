import { adminApi } from "@/lib/api";

export interface Booking {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    courtId: number;
    userId: number;
    totalPrice: number;
    User?: { name: string; email: string };
    Court?: { name: string; Venue?: { name: string } };
}

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
    }
};
