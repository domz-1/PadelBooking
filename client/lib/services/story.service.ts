import api from '../api';
import { Story, ApiListResponse, ApiResponse } from '../types';

export const storyService = {
    getStories: async () => {
        const response = await api.get<ApiListResponse<Story>>('/stories');
        return response.data;
    },

    createStory: async (formData: FormData) => {
        const response = await api.post<ApiResponse<Story>>('/stories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
