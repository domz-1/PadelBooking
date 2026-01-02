
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Venue, Booking } from "@/lib/models";
import { useAuthStore } from "@/hooks/use-auth-store";
import {
    Clock,
    MapPin,
    User,
    Plus
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


interface BookingGridProps {
    bookings: Booking[];
    venues: Venue[];
    date: string; // YYYY-MM-DD
    onCreateBooking: (venueId: number, time: string) => void;
    onViewBooking: (booking: Booking) => void;
    publicView?: boolean;
}

export default function BookingGrid({
    bookings,
    venues,
    onCreateBooking,
    onViewBooking,
    publicView = false
}: BookingGridProps) {
    const { user } = useAuthStore();
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM (matches typical hours)

    const formatHour = (hour: number) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h = hour % 12 || 12;
        return `${h}:00 ${ampm}`;
    };

    const formatTimeForValue = (hour: number) => {
        const h = hour.toString().padStart(2, '0');
        return `${h}:00`;
    };

    const getBooking = (venueId: number, hour: number) => {
        return bookings.find(b => {
            if (b.venueId !== venueId) return false;
            const [startHour] = b.startTime.split(':').map(Number);
            const [endHour] = b.endTime.split(':').map(Number);
            return hour >= startHour && hour < endHour;
        });
    };

    const isStartOfBooking = (booking: Booking | undefined, hour: number) => {
        if (!booking) return false;
        const [startHour] = booking.startTime.split(':').map(Number);
        return startHour === hour;
    };

    const isOwnBooking = (booking: Booking) => {
        return user && booking.userId === Number(user.id); // Ensure ID types match
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'confirmed': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
            'cancelled': 'bg-red-100 text-red-800 border-red-200',
            'pending-coach': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
            'no-show': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[status] || colors.pending;
    };

    return (
        <div className="w-[calc(100vw-4rem)] bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-4">
            <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                    {/* Header Row: Venues */}
                    <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(140px,1fr))] gap-2 mb-2 sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
                        <div className="h-10 flex items-center justify-center font-semibold text-gray-500 bg-gray-50 rounded text-xs gap-1">
                            <Clock className="w-3 h-3" />
                            Time
                        </div>
                        {venues.map(venue => (
                            <div
                                key={venue.id}
                                onClick={() => setSelectedVenue(venue)}
                                className="h-10 flex items-center justify-center font-semibold text-sm bg-gray-50 hover:bg-gray-100 rounded cursor-pointer gap-1 px-2 border border-transparent hover:border-gray-200 transition-all"
                            >
                                <MapPin className="w-3 h-3 text-brand-500" />
                                <span className="truncate">{venue.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Rows */}
                    {hours.map(hour => (
                        <div key={hour} className="grid grid-cols-[80px_repeat(auto-fit,minmax(140px,1fr))] gap-2 mb-2">
                            {/* Time Cell */}
                            <div className="h-20 flex items-center justify-center text-xs font-semibold text-muted-foreground bg-secondary/30 rounded border border-transparent">
                                {formatHour(hour)}
                            </div>

                            {/* Venue Cells */}
                            {venues.map(venue => {
                                const booking = getBooking(venue.id, hour);
                                const isBooked = !!booking;
                                const isStart = isStartOfBooking(booking, hour);

                                return (
                                    <div
                                        key={`${venue.id}-${hour}`}
                                        className={cn(
                                            "h-20 relative rounded-lg border transition-all duration-200",
                                            !isBooked && "bg-background hover:bg-secondary/40 cursor-pointer border-dashed border-border/60 hover:border-primary/50 group",
                                            isBooked && "border-none bg-transparent"
                                        )}
                                        onClick={() => !isBooked && onCreateBooking(venue.id, formatTimeForValue(hour))}
                                    >
                                        {/* Booking Slot */}
                                        {isBooked && isStart && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewBooking(booking);
                                                }}
                                                className={cn(
                                                    "absolute inset-0 z-10 rounded-md p-2 text-xs flex flex-col gap-1 cursor-pointer shadow-sm border animate-in fade-in zoom-in-95",
                                                    getStatusColor(booking.status),
                                                    isOwnBooking(booking) ? "ring-2 ring-primary ring-offset-1" : ""
                                                )}
                                                style={{
                                                    height: `calc(100% * ${parseInt(booking.endTime.split(':')[0]) - parseInt(booking.startTime.split(':')[0])} + ${(parseInt(booking.endTime.split(':')[0]) - parseInt(booking.startTime.split(':')[0]) - 1) * 0.5}rem)`,
                                                    zIndex: 20
                                                }}
                                            >
                                                <div className="font-bold truncate flex items-center gap-1.5">
                                                    {isOwnBooking(booking) && <User className="w-3.5 h-3.5" />}
                                                    {publicView && !isOwnBooking(booking) ? "Reserved" : (booking.User?.name || "User")}
                                                </div>
                                                <div className="flex justify-between items-center opacity-90 mt-auto">
                                                    <span className="truncate text-[10px] uppercase tracking-wider font-semibold">{booking.type || "Booking"}</span>
                                                    {!publicView && booking.totalPrice && <span className="font-mono">${booking.totalPrice}</span>}
                                                </div>
                                            </div>
                                        )}

                                        {/* Empty Slot Placeholder */}
                                        {!isBooked && (
                                            <div className="w-full h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs text-primary font-bold flex items-center gap-1">
                                                    <Plus className="w-3 h-3" /> Book
                                                </span>
                                                <span className="text-[10px] text-muted-foreground mt-0.5">${venue.pricePerHour}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Venue Info Modal */}
            <Dialog open={!!selectedVenue} onOpenChange={(open) => !open && setSelectedVenue(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedVenue?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-500 block">Type</span>
                                <span className="font-medium">{selectedVenue?.type || 'Standard'}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-500 block">Price / Hour</span>
                                <span className="font-medium text-brand-600">${selectedVenue?.pricePerHour}</span>
                            </div>
                        </div>
                        {selectedVenue?.description && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-500 block">Description</span>
                                <p className="text-sm mt-1 text-gray-700">{selectedVenue.description}</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
