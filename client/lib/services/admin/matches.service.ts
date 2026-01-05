import { adminApi } from "@/lib/api";

export interface Match {
  id: number;
  date: string;
  level: string;
  players: Array<{ id: number; name: string; email?: string }>;
}

export const adminMatchService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await adminApi.get<{
      success: boolean;
      data: Match[];
      count: number;
    }>("/matches", { params });
    return response.data;
  },

  deleteMatch: async (id: number) => {
    const response = await adminApi.delete(`/matches/${id}`);
    return response.data;
  },
};
