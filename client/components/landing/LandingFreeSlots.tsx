"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { socketService } from "@/lib/socket";
import { useAuthStore } from "@/hooks/use-auth-store";

export function LandingFreeSlots() {
    const [freeSlots, setFreeSlots] = useState<Record<string, string[]> | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchSlots = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        try {
            const today = new Date();
            const tomorrow = addDays(today, 1);

            const response = await api.get("/public/bookings/free-slots", {
                params: {
                    startDate: format(today, "yyyy-MM-dd"),
                    startTime: "17", // 5 PM
                    endDate: format(tomorrow, "yyyy-MM-dd"),
                    endTime: "03", // 3 AM next day
                    branchId: "all"
                }
            });

            if (response.data.success) {
                setFreeSlots(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch free slots", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const userId = useAuthStore.getState().user?.id;
        socketService.connect(userId ? Number(userId) : undefined);

        fetchSlots();

        const socket = socketService.getSocket();

        // Debounced refresh for socket events
        let refreshTimeout: NodeJS.Timeout;
        const handleBookingUpdate = () => {
            console.log("Booking update received [LandingFree], refreshing...");
            clearTimeout(refreshTimeout);
            refreshTimeout = setTimeout(fetchSlots, 1000);
        };

        if (socket) {
            socket.on("bookingUpdate", handleBookingUpdate);
        }

        return () => {
            if (refreshTimeout) clearTimeout(refreshTimeout);
            if (socket) {
                socket.off("bookingUpdate", handleBookingUpdate);
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!freeSlots || Object.keys(freeSlots).length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-muted/30">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Available Slots Tonight</h2>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                        Don't miss out! Check out the available court slots for tonight and tomorrow morning.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(freeSlots).map(([venueName, ranges]) => (
                        <Card key={venueName} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-card/50 backdrop-blur">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    {venueName}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {ranges.map((range, idx) => (
                                        <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm font-medium bg-primary/5 text-primary hover:bg-primary/10 transition-colors border-primary/10">
                                            <Clock className="w-3.5 h-3.5 mr-1.5 inline" />
                                            {range}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
