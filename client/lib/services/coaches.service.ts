import { api } from "@/lib/api";

export interface Coach {
    id: number;
    userId: number;
    hourlyRate: number;
    bio: string;
    experience: string;
    User?: {
        name: string;
        email: string;
    };
}

export const coachService = {
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: Coach[] }>('/coaches');
        return response.data;
    },

    // Additional client methods if needed (getById, etc.)
};
