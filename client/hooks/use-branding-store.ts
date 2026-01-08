"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { settingsService } from "@/lib/services/settings.service";

interface BrandingConfig {
    businessName: string;
    logo: string | null;
    themeColor: string;
    secondaryColor?: string;
    accentColor?: string;
    primaryForeground?: string;
    sidebarColor?: string;
}

interface BrandingState {
    config: BrandingConfig | null;
    loading: boolean;
    hydrated: boolean;
    lastFetched: number;
    fetchConfig: (force?: boolean) => Promise<void>;
    applyBranding: (data: BrandingConfig | null) => void;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const useBrandingStore = create<BrandingState>()(
    persist(
        (set, get) => ({
            config: null,
            loading: true,
            hydrated: false,
            lastFetched: 0,

            applyBranding: (data) => {
                if (!data) return;
                if (typeof document === 'undefined') return;

                // Inject CSS variables
                if (data.themeColor) {
                    document.documentElement.style.setProperty('--brand-color', data.themeColor);
                    document.documentElement.style.setProperty('--primary', data.themeColor);
                }
                if (data.secondaryColor) {
                    document.documentElement.style.setProperty('--secondary', data.secondaryColor);
                }
                if (data.accentColor) {
                    document.documentElement.style.setProperty('--accent', data.accentColor);
                }
                if (data.primaryForeground) {
                    document.documentElement.style.setProperty('--primary-foreground', data.primaryForeground);
                }
                if (data.sidebarColor) {
                    document.documentElement.style.setProperty('--sidebar', data.sidebarColor);
                }
            },

            fetchConfig: async (force = false) => {
                const { lastFetched, config, applyBranding } = get();
                const isExpired = Date.now() - lastFetched > CACHE_TTL;

                // If we have config and it's fresh, we can still revalidate in background
                if (config && !isExpired && !force) {
                    set({ loading: false });
                    applyBranding(config);

                    // Background revalidation (optional, but good for "under the hood" update)
                    // Only revalidate if it's been a while (e.g. 1 hour)
                    const needsRevalidate = Date.now() - lastFetched > 60 * 60 * 1000;
                    if (!needsRevalidate) return;
                }

                try {
                    const res = await settingsService.getConfig();
                    const newConfig = res.data;
                    set({
                        config: newConfig,
                        lastFetched: Date.now(),
                        loading: false
                    });
                    applyBranding(newConfig);
                } catch (error) {
                    console.error("Failed to fetch branding config", error);
                    set({ loading: false });
                }
            },
        }),
        {
            name: "branding-storage",
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.hydrated = true;
                    // Apply branding immediately after hydration if available
                    setTimeout(() => {
                        state.applyBranding(state.config);
                    }, 0);
                }
            }
        }
    )
);
