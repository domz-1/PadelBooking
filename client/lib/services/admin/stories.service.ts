import { adminApi } from "@/lib/api";

export interface Story {
    id: number;
    mediaUrl: string;
    userId: number;
}

export const adminStoryService = {
    deleteStory: async (id: number) => {
        const response = await adminApi.delete(`/stories/${id}`);
        return response.data;
    }
};
