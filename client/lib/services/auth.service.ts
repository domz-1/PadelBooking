import api from "../api";
import { AuthResponse, User, ApiResponse } from "../types";

export const authService = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    if (response.data.success && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    if (response.data.success && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore error
    } finally {
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
  },
};
