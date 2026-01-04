"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { settingsService } from "@/lib/services/settings.service"
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

const CACHE_KEY = "app_branding"
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<BrandingConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [bootstrapped, setBootstrapped] = useState(false)

    const applyBranding = useCallback((data: BrandingConfig | null) => {
        if (!data) return

        // Inject CSS variables
        if (data.themeColor) {
            document.documentElement.style.setProperty('--brand-color', data.themeColor)
            document.documentElement.style.setProperty('--primary', data.themeColor)
        }
        if (data.secondaryColor) {
            document.documentElement.style.setProperty('--secondary', data.secondaryColor)
        }
        if (data.accentColor) {
            document.documentElement.style.setProperty('--accent', data.accentColor)
        }
        if (data.primaryForeground) {
            document.documentElement.style.setProperty('--primary-foreground', data.primaryForeground)
        }
        if (data.sidebarColor) {
            document.documentElement.style.setProperty('--sidebar', data.sidebarColor)
        }
    }, [])

    useEffect(() => {
        // 1. Try to load from cache first for immediate render
        const cached = localStorage.getItem(CACHE_KEY)
        let lastFetched = 0

        if (cached) {
            try {
                const { data, timestamp } = JSON.parse(cached)
                setConfig(data)
                applyBranding(data)
                setBootstrapped(true)
                lastFetched = timestamp
            } catch (e) {
                console.warn("Failed to parse cached branding", e)
            }
        }

        const fetchConfig = async () => {
            try {
                const res = await settingsService.getConfig()
                const data = res.data
                setConfig(data)
                applyBranding(data)

                // Update cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }))
            } catch (error) {
                console.error("Failed to fetch branding config", error)
            } finally {
                setLoading(false)
                setBootstrapped(true)
            }
        }

        // 2. Fetch fresh config if cache is missing or expired
        const isExpired = Date.now() - lastFetched > CACHE_TTL
        if (!cached || isExpired) {
            fetchConfig()
        } else {
            // Background update even if not expired (revalidate)
            fetchConfig()
        }
    }, [applyBranding])

    const value = {
        brandName: config?.businessName || "PadelBooking",
        logo: config?.logo || null,
        themeColor: config?.themeColor || "#4CAF50",
        config,
        loading
    }

    if (!bootstrapped) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">
                    Loading {value.brandName}...
                </p>
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
