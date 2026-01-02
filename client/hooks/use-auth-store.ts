
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types";
import api from "@/lib/api";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (token, user) => {
                localStorage.setItem("token", token);
                set({ token, user, isAuthenticated: true });
            },
            logout: () => {
                localStorage.removeItem("token");
                set({ token: null, user: null, isAuthenticated: false });
            },
            fetchUser: async () => {
                try {
                    const { data } = await api.get("/auth/me");
                    if (data.success) {
                        set({ user: data.data, isAuthenticated: true });
                    }
                } catch {
                    set({ user: null, token: null, isAuthenticated: false });
                    localStorage.removeItem("token");
                }
            },
        }),
        {
            name: "auth-storage",
        }
    )
);
