import api from '@/api/api';

export const NotificationsAPI = {
    getMyNotifications: (params: any) => api.get('/notifications', { params }),
    markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
    sendBroadcast: (data: any) => api.post('/notifications/broadcast', data),
};
