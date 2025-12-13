import api from '@/api/api';

export const BookingsAPI = {
    getAllBookings: (params: any) => api.get('/bookings', { params }),
    getBooking: (id: string) => api.get(`/bookings/${id}`),
    createBooking: (data: any) => api.post('/bookings', data),
    updateBooking: (id: string, data: any) => api.put(`/bookings/${id}`, data),
    deleteBooking: (id: string) => api.delete(`/bookings/${id}`),
    getDailySummary: () => api.get('/bookings/daily-summary'),
};
