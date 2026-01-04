import { adminApi } from "@/lib/api";
import { type Booking, type WaitlistEntry } from "@/lib/schemas";

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

    deleteBooking: async (id: number, seriesOption: string = 'single') => {
        const response = await adminApi.delete(`/bookings/${id}`, { params: { seriesOption } });
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
    },

    update: async (id: number, data: Partial<Booking> & { seriesOption?: string }) => {
        const response = await adminApi.put<{ success: boolean; data: Booking }>(`/bookings/${id}`, data);
        return response.data;
    },

    getWaitlistForSlot: async (params: { venueId: number; date: string; startTime: string; endTime: string }) => {
        const response = await adminApi.get<{ success: boolean; data: WaitlistEntry[] }>('/bookings/waitlist/slot', { params });
        return response.data;
    },

    joinWaitlist: async (data: { userId: number; venueId: number; date: string; startTime: string; endTime: string }) => {
        const response = await adminApi.post<{ success: boolean; data: WaitlistEntry }>('/bookings/waitlist', data);
        return response.data;
    },

    deleteWaitlistEntry: async (id: number) => {
        const response = await adminApi.delete<{ success: boolean }>(`/bookings/waitlist/${id}`);
        return response.data;
    },

    create: async (data: Partial<Booking>) => {
        const response = await adminApi.post<{ success: boolean; data: Booking }>('/bookings', data);
        return response.data;
    }
};
