import api from "../api";
import { Notification, ApiListResponse } from "../types";

export const notificationService = {
  getMyNotifications: async () => {
    const response =
      await api.get<ApiListResponse<Notification>>("/notifications");
    return response.data;
  },

  markAsRead: async (id: string | number) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  broadcast: async (data: { title: string; message: string }) => {
    const response = await api.post("/notifications/broadcast", data);
    return response.data;
  },
};
