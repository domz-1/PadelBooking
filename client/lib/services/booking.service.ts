import api from '../api';
import { Booking, ApiListResponse, ApiResponse } from '../types';

export const bookingService = {
    create: async (data: { venueId: number; date: string; startTime: string; endTime: string; type?: 'standard' | 'academy' }) => {
        const response = await api.post<ApiResponse<Booking>>('/bookings', data);
        return response.data;
    },

    getMyBookings: async () => {
        const response = await api.get<ApiListResponse<Booking>>('/bookings/my-bookings');
        return response.data;
    },



    getById: async (id: string | number) => {
        const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
        return response.data;
    },

    update: async (id: string | number, data: Partial<Booking>) => {
        const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}`, data);
        return response.data;
    },

    delete: async (id: string | number) => {
        const response = await api.delete(`/bookings/${id}`);
        return response.data;
    },

    // Waitlist
    joinWaitlist: async (data: { venueId: number; date: string; startTime: string; endTime: string }) => {
        const response = await api.post('/bookings/waitlist', data);
        return response.data;
    },

    getMyWaitlist: async () => {
        const response = await api.get('/bookings/waitlist');
        return response.data;
    },

    leaveWaitlist: async (id: string | number) => {
        const response = await api.delete(`/bookings/waitlist/${id}`);
        return response.data;
    },

    // Open Match Methods
    convertToOpenMatch: async (bookingId: string | number, maxPlayers: number = 4) => {
        const response = await api.post(`/bookings/${bookingId}/convert-to-open-match`, { maxPlayers });
        return response.data;
    },

    joinOpenMatch: async (bookingId: string | number) => {
        const response = await api.post(`/bookings/${bookingId}/join`);
        return response.data;
    },

    leaveOpenMatch: async (bookingId: string | number) => {
        const response = await api.post(`/bookings/${bookingId}/leave`);
        return response.data;
    },

    getOpenMatches: async (date?: string) => {
        const response = await api.get('/bookings/open-matches', { params: { date } });
        return response.data;
    }
};
