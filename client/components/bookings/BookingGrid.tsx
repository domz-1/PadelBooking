"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Venue, Booking, Branch } from "@/lib/schemas";
import { useAuthStore } from "@/hooks/use-auth-store";
import {
    Clock,
    MapPin,
    User,
    Plus,
    Shield,
    Pencil,
    Trash2,
    CalendarPlus
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface BookingGridProps {
    bookings: Booking[];
    venues: Venue[];
    branches?: Branch[]; // Optional for now, assuming passed from parent
    date: string; // YYYY-MM-DD
    onCreateBooking: (venueId: number, time: string) => void;
    onViewBooking: (booking: Booking) => void;
    onJoinWaitlist?: (venueId: number, time: string) => void; // New Prop
    onEditBooking?: (booking: Booking) => void;
    onDeleteBooking?: (bookingId: number) => void;
    publicView?: boolean;
}

export default function BookingGrid({
    bookings,
    venues,
    branches = [],
    onCreateBooking,
    onViewBooking,
    onJoinWaitlist,
    onEditBooking,
    onDeleteBooking,
    publicView = false
}: BookingGridProps) {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [selectedBranchId, setSelectedBranchId] = useState<number | 'all'>('all');

    // Filter venues by branch if branches exist
    const filteredVenues = useMemo(() => {
        if (selectedBranchId === 'all') return venues;
        return venues.filter(v => v.branchId === selectedBranchId);
    }, [venues, selectedBranchId]);

    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

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
        if (!user) return false;
        if (typeof booking.userId === 'string' || typeof user.id === 'string') {
            return String(booking.userId) === String(user.id);
        }
        return booking.userId === user.id;
    };

    const getStatusColor = (status: string, isOwn: boolean) => {
        if (!isOwn) return 'bg-primary/90 text-primary-foreground border-primary'; // Blocked for others

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
        <div className="w-full space-y-4">
            {/* Branch Selector */}
            {branches.length > 0 && (
                <div className="flex justify-center">
                    <Tabs defaultValue="all" onValueChange={(v) => setSelectedBranchId(v === 'all' ? 'all' : Number(v))}>
                        <TabsList>
                            <TabsTrigger value="all">All Branches</TabsTrigger>
                            {branches.map(b => (
                                <TabsTrigger key={b.id} value={String(b.id)}>{b.name}</TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            )}

            <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-4">
                <ScrollArea className="w-full">
                    {/* Make grid full width of container, but minimum width to prevent squishing */}
                    <div className="min-w-[1000px] w-full">
                        {/* Header Row: Venues */}
                        <div
                            className="grid gap-2 mb-2 sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur py-2"
                            style={{ gridTemplateColumns: `80px repeat(${filteredVenues.length}, 1fr)` }}
                        >
                            <div className="h-10 flex items-center justify-center font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 rounded text-xs gap-1">
                                <Clock className="w-3 h-3" />
                                Time
                            </div>
                            {filteredVenues.map(venue => (
                                <div
                                    key={venue.id}
                                    onClick={() => setSelectedVenue(venue)}
                                    className="h-10 flex items-center justify-center font-semibold text-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer gap-1 px-2 border border-transparent hover:border-gray-200 transition-all text-center"
                                >
                                    <MapPin className="w-3 h-3 text-brand-500" />
                                    <span className="truncate">{venue.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Grid Rows */}
                        {hours.map(hour => (
                            <div
                                key={hour}
                                className="grid gap-2 mb-2"
                                style={{ gridTemplateColumns: `80px repeat(${filteredVenues.length}, 1fr)` }}
                            >
                                {/* Time Cell */}
                                <div className="h-24 flex items-center justify-center text-xs font-semibold text-muted-foreground bg-secondary/30 rounded border border-transparent">
                                    {formatHour(hour)}
                                </div>

                                {/* Venue Cells */}
                                {filteredVenues.map(venue => {
                                    const booking = getBooking(venue.id, hour);
                                    const isBooked = !!booking;
                                    const isStart = isStartOfBooking(booking, hour);
                                    const isOwn = booking ? isOwnBooking(booking) : false;

                                    return (
                                        <div
                                            key={`${venue.id}-${hour}`}
                                            className={cn(
                                                "h-24 relative rounded-lg border transition-all duration-200",
                                                !isBooked && "bg-background hover:bg-secondary/40 cursor-pointer border-dashed border-border/60 hover:border-primary/50 group flex flex-col items-center justify-center",
                                                isBooked && "border-none bg-transparent"
                                            )}
                                            onClick={() => !isBooked && onCreateBooking(venue.id, formatTimeForValue(hour))}
                                        >
                                            {/* Booking Slot */}
                                            {isBooked && isStart && (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isOwn) {
                                                            onViewBooking(booking);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "absolute inset-0 z-20 rounded-md p-2 text-xs flex flex-col gap-1 shadow-sm border animate-in fade-in zoom-in-95 overflow-hidden",
                                                        getStatusColor(booking.status, isOwn),
                                                        isOwn ? "cursor-pointer ring-2 ring-primary ring-offset-1" : "cursor-not-allowed opacity-90"
                                                    )}
                                                    style={{
                                                        height: `calc(100% * ${parseInt(booking.endTime.split(':')[0]) - parseInt(booking.startTime.split(':')[0])} + ${(parseInt(booking.endTime.split(':')[0]) - parseInt(booking.startTime.split(':')[0]) - 1) * 0.5}rem)`,
                                                    }}
                                                >
                                                    <div className="font-bold truncate flex items-center justify-between gap-1.5">
                                                        <div className="flex items-center gap-1">
                                                            {isOwn ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                                            {publicView ? "Reserved" : (isOwn ? "My Booking" : "Booked")}
                                                        </div>
                                                    </div>

                                                    {isOwn && (
                                                        <>
                                                            <div className="mt-1 opacity-90 truncate text-[10px]">
                                                                {booking.User?.name}
                                                            </div>
                                                            <div className="flex justify-between items-center opacity-90 mt-auto">
                                                                <span className="truncate text-[10px] uppercase tracking-wider font-semibold">{booking.type || "Standard"}</span>
                                                                {!publicView && booking.totalPrice && <span className="font-mono">${booking.totalPrice}</span>}
                                                            </div>
                                                            {/* Action Buttons for Owner */}
                                                            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 rounded p-1 backdrop-blur-sm">
                                                                {onEditBooking && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onEditBooking(booking); }}
                                                                        className="p-1 hover:bg-white/30 rounded text-foreground"
                                                                        title="Edit"
                                                                    >
                                                                        <Pencil className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                                {onDeleteBooking && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onDeleteBooking(booking.id); }}
                                                                        className="p-1 hover:bg-red-500/30 rounded text-red-700 dark:text-red-300"
                                                                        title="Cancel"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Empty Slot Placeholder */}
                                            {!isBooked && (
                                                <div className="w-full h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-xs text-primary font-bold flex items-center gap-1 mb-1">
                                                        <Plus className="w-3 h-3" /> Book
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">${venue.pricePerHour}</span>

                                                    {/* Waitlist Option (Visual only for now if not hovered, but could be separate action) */}
                                                    {onJoinWaitlist && (
                                                        <button
                                                            className="mt-2 text-[10px] flex items-center gap-1 text-orange-600 hover:underline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onJoinWaitlist(venue.id, formatTimeForValue(hour));
                                                            }}
                                                        >
                                                            <CalendarPlus className="w-3 h-3" /> Waitlist
                                                        </button>
                                                    )}
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
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-xs text-gray-500 block">Type</span>
                                    <span className="font-medium">{selectedVenue?.type || 'Standard'}</span>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-xs text-gray-500 block">Price / Hour</span>
                                    <span className="font-medium text-brand-600">${selectedVenue?.pricePerHour}</span>
                                </div>
                            </div>
                            {selectedVenue?.Branch && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-xs text-gray-500 block">Branch</span>
                                    <span className="font-medium">{selectedVenue.Branch.name}</span>
                                    <span className="text-xs text-gray-400 block mt-0.5">{selectedVenue.Branch.location}</span>
                                </div>
                            )}
                            {selectedVenue?.description && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-xs text-gray-500 block">Description</span>
                                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{selectedVenue.description}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
