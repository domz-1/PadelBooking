"use client"

import React, { createContext, useContext, useEffect } from "react"
import { useBrandingStore } from "@/hooks/use-branding-store"
import { Loader2 } from "lucide-react"

interface BrandingConfig {
    businessName: string;
    logo: string | null;
    themeColor: string;
    secondaryColor?: string;
    accentColor?: string;
    primaryForeground?: string;
    sidebarColor?: string;
}

interface BrandingContextType {
    brandName: string
    logo: string | null
    themeColor: string
    config: BrandingConfig | null
    loading: boolean
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const { config, loading, hydrated, fetchConfig } = useBrandingStore();

    useEffect(() => {
        if (hydrated) {
            fetchConfig();
        }
    }, [fetchConfig, hydrated]);

    useEffect(() => {
        if (config?.businessName) {
            document.title = config.businessName;
        }
        if (config?.logo) {
            // Remove existing icon links to prevent conflicts
            const existingIcons = document.querySelectorAll("link[rel~='icon'], link[rel='apple-touch-icon']");
            existingIcons.forEach(el => el.remove());

            // Add new favicon
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = `${config.logo}?v=${Date.now()}`;
            document.head.appendChild(link);

            // Add new Apple touch icon
            const appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            appleLink.href = `${config.logo}?v=${Date.now()}`;
            document.head.appendChild(appleLink);
        }
    }, [config]);

    const value = {
        brandName: config?.businessName || "PadelBooking",
        logo: config?.logo || null,
        themeColor: config?.themeColor || "#4CAF50",
        config,
        loading
    }

    if (loading && !config) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-gray-900 mb-4" />
            </div>
        )
    }

    return (
        <BrandingContext.Provider value={value}>
            {children}
        </BrandingContext.Provider>
    )
}

export const useBranding = () => {
    const context = useContext(BrandingContext)
    if (context === undefined) {
        throw new Error("useBranding must be used within a BrandingProvider")
    }
    return context
}
