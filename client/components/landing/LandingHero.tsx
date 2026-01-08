"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Loader2, Sparkles, Copy, ClipboardCheck } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { useBranding } from "@/components/providers/BrandingProvider";

export function LandingHero() {
    const router = useRouter();
    const { brandName } = useBranding();
    const [freeSlots, setFreeSlots] = useState<Record<string, string[]> | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const today = new Date();
                const tomorrow = addDays(today, 1);

                const response = await api.get("/public/bookings/free-slots", {
                    params: {
                        startDate: format(today, "yyyy-MM-dd"),
                        startTime: "17",
                        endDate: format(tomorrow, "yyyy-MM-dd"),
                        endTime: "03",
                        branchId: "all"
                    }
                });

                if (response.data.success) {
                    setFreeSlots(response.data.data);
                    setLastUpdated(new Date());
                }
            } catch (error) {
                console.error("Failed to fetch free slots", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, []);

    const handleCopy = () => {
        if (!freeSlots || Object.keys(freeSlots).length === 0) {
            toast.info("No empty slots found for tonight.");
            return;
        }

        const bookingUrl = typeof window !== "undefined" ? `${window.location.origin}/bookings` : "";
        const updateTime = lastUpdated ? format(lastUpdated, "h:mm a") : format(new Date(), "h:mm a");

        let text = `*🎾 ${brandName} - Available Padel Slots*\n`;
        text += `_Last update: ${updateTime}_\n\n`;

        Object.entries(freeSlots).forEach(([venueName, ranges]) => {
            text += `*📍 ${venueName}:*\n`;
            text += `   ${ranges.join(", ")}\n\n`;
        });

        text += `*🔗 Book your slot now:*\n${bookingUrl}`;

        navigator.clipboard.writeText(text.trim());
        setCopied(true);
        toast.success("Formatted slots copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative isolate overflow-hidden bg-background">
            {/* Background Decor */}
            <div className="absolute inset-x-0 -top-32 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-primary to-brand-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75" />
            </div>

            <div className="mx-auto max-w-7xl px-6 pb-24 pt-4 sm:pb-32 lg:flex lg:px-8 lg:py-18 gap-12 items-center">
                {/* Left Content */}
                <div className="mx-auto max-w-2xl shrink-0 lg:mx-0 lg:max-w-xl">
                    <div className=" ">
                        <div className="inline-flex space-x-6 items-center">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                Live Availability
                            </span>
                        </div>
                    </div>
                    <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-7xl">
                        Book Your Perfect <span className="text-primary italic">Padel Court</span>
                    </h1>
                    <p className="mt-6 text-xl leading-8 text-muted-foreground">
                        Experience the best Padel facilities in the region. Seamless booking, real-time availability, and a vibrant community of players.
                    </p>

                    {/* Quick Metrics */}
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 items-center text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-md">6+</span>
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Premium Courts</span>
                        </div>
                        <div className="hidden sm:block h-3 w-px bg-border/60" />
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-md">24/7</span>
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Online Booking</span>
                        </div>
                        <div className="hidden sm:block h-3 w-px bg-border/60" />
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-md">500+</span>
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Active Players</span>
                        </div>
                    </div>
                    <div className="mt-10 flex items-center gap-x-6">
                        <Button size="lg" onClick={() => router.push("/bookings")} className="rounded-full shadow-lg hover:shadow-primary/20 transition-all">
                            Book a Slot Now
                        </Button>
                        {/* <Button variant="ghost" size="lg" onClick={() => router.push("/auth/login")} className="rounded-full text-lg">
                            Login Member <span aria-hidden="true" className="ml-2">→</span>
                        </Button> */}
                    </div>

                </div>

                {/* Right Content - The "Live Dashboard" */}
                <div className="relative mt-16 sm:mt-24 lg:mt-0 lg:flex-1 lg:-translate-y-16">
                    {/* Main Image Backdrop */}
                    <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-border/50">
                        <Image
                            src="/new-h-2.png"
                            alt="Padel Court"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
                    </div>

                    {/* Floating Slots Board */}
                    <div className="absolute -bottom-16 -left-6 right-6 lg:-right-12 bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-6 lg:max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    Available Tonight
                                </h3>
                                <p className="text-[10px] indent-4 text-muted-foreground uppercase tracking-tight">
                                    Last update: {lastUpdated ? format(lastUpdated, "h:mm a") : "..."}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                    onClick={handleCopy}
                                    title="Copy for WhatsApp/Sharing"
                                >
                                    {copied ? <ClipboardCheck className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs text-primary h-8" onClick={() => router.push("/bookings")}>
                                    View All
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[390px] overflow-y-auto pr-2 custom-scrollbar ">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    <p className="text-xs text-muted-foreground">Checking courts...</p>
                                </div>
                            ) : freeSlots && Object.keys(freeSlots).length > 0 ? (
                                Object.entries(freeSlots).map(([fullVenueName, ranges]) => {
                                    const [name, branch] = fullVenueName.includes('(')
                                        ? fullVenueName.split(/[()]/).filter(Boolean).map(s => s.trim())
                                        : [fullVenueName, ''];

                                    return (
                                        <div key={fullVenueName} className="group pointer-events-none">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                                <div className="flex flex-row items-center gap-2">
                                                    <span className="text-sm font-semibold transition-colors">{name}</span>
                                                    {branch && <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{branch}</span>}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 pl-5">
                                                {ranges.map((range, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[10px] pointer-events-none font-medium py-0 h-5 px-2 bg-primary/5  border-primary/20 transition-colors">
                                                        <Clock className="w-2.5 h-2.5 mr-1" />
                                                        {range}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-center py-8 text-muted-foreground italic">No slots available tonight. Try another day!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
