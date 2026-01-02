import api from '../api';
import { Message, ApiListResponse, ApiResponse } from '../types';

export const chatService = {
    sendMessage: async (data: { receiverId: string; message: string }) => {
        const response = await api.post<ApiResponse<Message>>('/chat', data);
        return response.data;
    },

    getMessages: async (userId: string) => {
        const response = await api.get<ApiListResponse<Message>>(`/chat/${userId}`);
        return response.data;
    }
};
