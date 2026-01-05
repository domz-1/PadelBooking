"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Venue, Booking, Branch } from "@/lib/schemas";
import { useAuthStore } from "@/hooks/use-auth-store";
import { bookingService } from "@/lib/services/booking.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Clock,
    MapPin,
    User,
    Plus,
    Shield,
    Pencil,
    Trash2,
    CalendarPlus,
    Loader2,
    Users,
    Repeat
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { EditBookingDialog } from "@/components/admin/bookings/EditBookingDialog";
import { AdminCreateBookingDialog } from "@/components/admin/bookings/AdminCreateBookingDialog";
import { BookingDetailsModal } from "@/components/admin/bookings/BookingDetailsModal";
import { BookingSkeleton } from "@/components/ui/booking-skeleton";


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
    onConvertToOpenMatch?: (bookingId: number, maxPlayers?: number) => void;
    onJoinOpenMatch?: (bookingId: number) => void;
    onLeaveOpenMatch?: (bookingId: number) => void;
    publicView?: boolean;
    waitlistEntries?: any[];
    onWaitlistUpdate?: () => void;
    loading?: boolean; // New loading prop
    selectedBranchId?: string | number; // Added for branch filtering
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
    onConvertToOpenMatch,
    onJoinOpenMatch,
    onLeaveOpenMatch,
    date,
    publicView = false,
    waitlistEntries = [],
    onWaitlistUpdate,
    loading = false
}: BookingGridProps) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [localSelectedBranchId, setLocalSelectedBranchId] = useState<number | 'all'>('all');

    // Determine if user can book based on authentication status
    const canBook = isAuthenticated && !publicView;

    // Sync the selectedBranchId prop with local state
    useEffect(() => {
        if (selectedBranchId !== undefined) {
            setLocalSelectedBranchId(selectedBranchId === 'all' ? 'all' : Number(selectedBranchId));
        }
    }, [selectedBranchId]);

    // Modals State
    const [showWaitlistModal, setShowWaitlistModal] = useState(false);
    const [showManagementModal, setShowManagementModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showOpenMatchModal, setShowOpenMatchModal] = useState(false);
    const [showConvertToOpenMatchModal, setShowConvertToOpenMatchModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isLoadingInternal, setIsLoadingInternal] = useState(false);
    const [slotInfo, setSlotInfo] = useState<{ venueId: number; time: string } | null>(null);
    const [editDuration, setEditDuration] = useState<number>(1);
    const [isEditing, setIsEditing] = useState(false);
    const [showAdminCreate, setShowAdminCreate] = useState(false);
    const [adminCreateSlot, setAdminCreateSlot] = useState<{ venueId: number; venueName: string; time: string } | null>(null);
    const [openMatchMaxPlayers, setOpenMatchMaxPlayers] = useState<number>(4);

    // Filter venues by branch if branches exist
    const filteredVenues = useMemo(() => {
        if (localSelectedBranchId === 'all') return venues;
        return venues.filter(v => v.branchId === localSelectedBranchId);
    }, [venues, localSelectedBranchId]);

    const hours = Array.from({ length: 24 }, (_, i) => i); // 12 AM to 11 PM (0-23)

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

    const getWaitlistEntry = (venueId: number, hour: number) => {
        const timeStr = formatTimeForValue(hour); // HH:00
        return waitlistEntries.find(w => {
            if (Number(w.venueId) !== Number(venueId)) return false;
            if (w.date !== date) return false;
            // Compare first 5 characters (HH:MM) to ignore potential seconds (:SS)
            const wTime = w.startTime.substring(0, 5);
            return wTime === timeStr;
        });
    };

    const isOwnBooking = (booking: Booking) => {
        if (!user) return false;
        return String(booking.userId) === String(user.id);
    };

    const isAdmin = user?.role === 'admin';

    const isUserInOpenMatch = (booking: Booking) => {
        if (!booking.openMatchPlayers || !user) return false;
        return booking.openMatchPlayers.some(id => String(id) === String(user.id));
    };

    const getOpenMatchPlayerCount = (booking: Booking) => {
        if (!booking.openMatchPlayers) return 0;
        return booking.openMatchPlayers.length;
    };

    const getStatusStyle = (booking: Booking, isOwn: boolean) => {
        if (!isOwn && !isAdmin) return { className: 'bg-primary/90 text-primary-foreground border-primary' }; // Blocked for others

        // Use status color if available
        if (booking.BookingStatus?.color) {
            const color = booking.BookingStatus.color;
            return {
                style: {
                    backgroundColor: `color-mix(in srgb, ${color}, transparent 87%)`,
                    color: color,
                    borderColor: `color-mix(in srgb, ${color}, transparent 73%)`
                },
                className: 'hover:bg-opacity-20'
            };
        }

        // Fallback to hardcoded colors if status not found
        const colors: Record<string, string> = {
            'confirmed': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
            'cancelled': 'bg-red-100 text-red-800 border-red-200',
            'pending-coach': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
            'no-show': 'bg-gray-100 text-gray-800 border-gray-200',
            'completed': 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200'
        };
        const status = (booking.status as string) || 'pending';
        const statusKey = (booking.status as string) || 'pending';
        return { className: colors[statusKey] || colors.pending };
    };

    const handleUpdateBooking = async () => {
        if (!selectedBooking?.id) return;
        setIsLoadingInternal(true);
        try {
            const [hour] = selectedBooking.startTime.split(':').map(Number);
            const endHour = hour + editDuration;
            const endTime = `${Math.floor(endHour).toString().padStart(2, '0')}:${(endHour % 1 * 60).toString().padStart(2, '0')}`;

            await bookingService.update(selectedBooking.id, {
                endTime
            });
            toast.success("Booking updated!");
            setShowManagementModal(false);
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update booking");
        } finally {
            setIsLoadingInternal(false);
        }
    };

    const handleJoinWaitlist = async () => {
        if (!slotInfo) return;
        setIsLoadingInternal(true);
        try {
            const [hour] = slotInfo.time.split(':').map(Number);
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

            await bookingService.joinWaitlist({
                venueId: slotInfo.venueId,
                date,
                startTime: slotInfo.time,
                endTime
            });
            toast.success("Joined waitlist! You will be notified if this slot becomes available.");
            setShowWaitlistModal(false);
            onWaitlistUpdate?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to join waitlist");
        } finally {
            setIsLoadingInternal(false);
        }
    };

    const handleLeaveWaitlist = async () => {
        const entry = slotInfo ? getWaitlistEntry(slotInfo.venueId, parseInt(slotInfo.time.split(':')[0])) : null;
        if (!entry?.id) return;
        setIsLoadingInternal(true);
        try {
            await bookingService.leaveWaitlist(entry.id);
            toast.success("Left waitlist!");
            setShowWaitlistModal(false);
            onWaitlistUpdate?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to leave waitlist");
        } finally {
            setIsLoadingInternal(false);
        }
    };

    const handleDeleteBooking = async () => {
        if (!selectedBooking?.id) return;
        setIsLoadingInternal(true);
        try {
            await bookingService.delete(selectedBooking.id);
            toast.success("Booking cancelled successfully");
            setShowDeleteConfirm(false);
            setShowManagementModal(false);
            // Optionally redirect or refresh via parent - but socket should handle update
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel booking");
        } finally {
            setIsLoadingInternal(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            {loading ? (
                <BookingSkeleton />
            ) : (
                <>
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

                    {/* Create Open Match Button */}
                    <div className="flex justify-end mb-4">
                        <Button
                            onClick={() => setShowOpenMatchModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            Create Open Match
                        </Button>
                    </div>

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
                                            className="h-14 flex flex-col items-center justify-center font-semibold text-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer gap-0.5 px-2 border border-transparent hover:border-gray-200 transition-all text-center"
                                        >
                                            {venue.Branch && (
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wide truncate max-w-full">
                                                    {venue.Branch.name}
                                                </span>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-brand-500" />
                                                <span className="truncate">{venue.name}</span>
                                            </div>
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
                                            const waitlisted = getWaitlistEntry(venue.id, hour);

                                            return (
                                                <div
                                                    key={`${venue.id}-${hour}`}
                                                    className={cn(
                                                        "h-24 relative rounded-lg border transition-all duration-200",
                                                        !isBooked && "bg-background hover:bg-secondary/40 cursor-pointer border-dashed border-border/60 hover:border-primary/50 group flex flex-col items-center justify-center",
                                                        isBooked && "border-none bg-transparent",
                                                        waitlisted && "border-orange-400 border-2 bg-orange-50/30"
                                                    )}
                                                    onClick={() => {
                                                        if (!isBooked) {
                                                            if (isAdmin) {
                                                                setAdminCreateSlot({
                                                                    venueId: venue.id,
                                                                    venueName: venue.name,
                                                                    time: formatTimeForValue(hour)
                                                                });
                                                                setShowAdminCreate(true);
                                                            } else if (canBook) {
                                                                // Only allow booking if user is authenticated and not in public view
                                                                onCreateBooking(venue.id, formatTimeForValue(hour));
                                                            } else if (!isAuthenticated) {
                                                                // Redirect to login if user is not authenticated
                                                                router.push("/auth/login");
                                                            }
                                                            // If publicView is true but user is authenticated, don't allow booking
                                                        }
                                                    }}
                                                >
                                                    {/* Booking Slot */}
                                                    {isBooked && isStart && (
                                                        <div
                                                            className={cn(
                                                                "absolute inset-0 z-20 rounded-md p-2 text-xs flex flex-col gap-1 shadow-sm border animate-in fade-in zoom-in-95 overflow-hidden transition-transform active:scale-[0.98]",
                                                                getStatusStyle(booking, isOwn).className,
                                                                "cursor-pointer ring-offset-1",
                                                                isOwn && "ring-2 ring-primary"
                                                            )}
                                                            style={{
                                                                ...getStatusStyle(booking, isOwn).style,
                                                                height: `calc(100% * ${parseInt(booking.endTime.split(':')[0]) - parseInt(booking.startTime.split(':')[0])} + ${(parseInt(booking.endTime.split(':')[0]) - parseInt(booking.startTime.split(':')[0]) - 1) * 0.5}rem)`,
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isAuthenticated) {
                                                                    router.push("/auth/login");
                                                                    return;
                                                                }
                                                                if (isOwn || isAdmin) {
                                                                    setSelectedBooking(booking);
                                                                    setShowDetailsModal(true); // Use details modal instead
                                                                } else if (booking.isOpenMatch) {
                                                                    // Handle Open Match join/leave
                                                                    if (isUserInOpenMatch(booking)) {
                                                                        // User is already in the match, offer to leave
                                                                        onLeaveOpenMatch?.(booking.id as number);
                                                                    } else {
                                                                        // User can join the match
                                                                        onJoinOpenMatch?.(booking.id as number);
                                                                    }
                                                                } else {
                                                                    setSlotInfo({ venueId: venue.id, time: formatTimeForValue(hour) });
                                                                    setShowWaitlistModal(true);
                                                                }
                                                            }}
                                                        >
                                                            {waitlisted && (
                                                                <div className="absolute top-1 right-1 z-30">
                                                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-[9px] px-1.5 h-4.5 border-white shadow-sm animate-pulse">
                                                                        My Waitlist
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                            <div className="font-bold truncate flex items-center justify-between gap-1.5">
                                                                <div className="flex items-center gap-1">
                                                                    {isOwn ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                                                    {/* User name always visible for admin or owner */}
                                                                    {(isOwn || isAdmin) && (
                                                                        <span className="truncate">{booking.User?.name || "Booked"}</span>
                                                                    )}
                                                                    {!isOwn && !isAdmin && <span>Reserved</span>}
                                                                </div>
                                                            </div>

                                                            {(isOwn || isAdmin) && (
                                                                <div className="flex justify-between items-center opacity-90 mt-auto">
                                                                    <span className="truncate text-[9px] uppercase tracking-wider font-bold">
                                                                        {booking.BookingStatus?.name || booking.status || (booking.type === 'academy' ? 'Academy' : 'Standard')}
                                                                    </span>
                                                                    {booking.recurrenceId && (
                                                                        <span className="truncate text-[9px] uppercase tracking-wider font-bold">
                                                                            <Repeat />
                                                                        </span>
                                                                    )}
                                                                    
                                                                </div>
                                                            )}
                                                            {booking.isOpenMatch && (
                                                                <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center text-[9px]">
                                                                    <Badge className="bg-green-600 hover:bg-green-700 text-white h-4 px-1.5 flex items-center gap-1">
                                                                        <Users className="w-2.5 h-2.5" />
                                                                        Open Match
                                                                    </Badge>
                                                                    <span className="text-green-700 font-bold">
                                                                        {getOpenMatchPlayerCount(booking)}/{booking.openMatchMaxPlayers || 4}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Empty Slot Placeholder */}
                                                    {!isBooked && (
                                                        <div className="w-full h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {waitlisted && (
                                                                <div className="absolute top-1 right-1 z-30 pointer-events-none">
                                                                    <Badge className="bg-orange-500 text-[9px] px-1.5 h-4.5 border-white shadow-sm">
                                                                        My Waitlist
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                            {canBook ? (
                                                                <>
                                                                    <span className="text-xs text-primary font-bold flex items-center gap-1 mb-1">
                                                                        <Plus className="w-3 h-3" /> Book
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">${venue.pricePerHour}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                                                    <Plus className="w-3 h-3" /> Available
                                                                </span>
                                                            )}

                                                            {/* Waitlist Option - Enhanced */}
                                                            {canBook && (
                                                                <>
                                                                    {getWaitlistEntry(venue.id, hour) ? (
                                                                        <button
                                                                            className="mt-2 text-[10px] flex items-center gap-1 text-red-600 hover:underline font-medium"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSlotInfo({ venueId: venue.id, time: formatTimeForValue(hour) });
                                                                                setShowWaitlistModal(true);
                                                                            }}
                                                                        >
                                                                            <CalendarPlus className="w-3 h-3" />
                                                                            Leave Waitlist
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            className="mt-2 text-[10px] flex items-center gap-1 text-orange-600 hover:underline"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSlotInfo({ venueId: venue.id, time: formatTimeForValue(hour) });
                                                                                setShowWaitlistModal(true);
                                                                            }}
                                                                        >
                                                                            <CalendarPlus className="w-3 h-3" />
                                                                            Join Waitlist
                                                                        </button>
                                                                    )}
                                                                </>
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

                        {/* Waitlist Modal */}
                        <Dialog open={showWaitlistModal} onOpenChange={setShowWaitlistModal}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {slotInfo && getWaitlistEntry(slotInfo.venueId, parseInt(slotInfo.time.split(':')[0]))
                                            ? "Confirm Leave Waitlist"
                                            : "Confirm Join Waitlist"}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="py-6 text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {slotInfo && getWaitlistEntry(slotInfo.venueId, parseInt(slotInfo.time.split(':')[0]))
                                            ? "You are currently on the waitlist for this slot. Are you sure you want to leave the waitlist?"
                                            : "This slot is currently fully booked. Would you like to join the waitlist? We will notify you immediately if it becomes available."}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 text-left">
                                        <div className="p-3 bg-secondary/50 rounded-lg">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Time</Label>
                                            <div className="text-sm font-semibold">{slotInfo?.time}</div>
                                        </div>
                                        <div className="p-3 bg-secondary/50 rounded-lg">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Date</Label>
                                            <div className="text-sm font-semibold">{date}</div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowWaitlistModal(false)} disabled={loading}>
                                        Cancel
                                    </Button>
                                    {slotInfo && getWaitlistEntry(slotInfo.venueId, parseInt(slotInfo.time.split(':')[0])) ? (
                                        <Button variant="destructive" onClick={handleLeaveWaitlist} disabled={loading}>
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Leave Waitlist
                                        </Button>
                                    ) : (
                                        <Button onClick={handleJoinWaitlist} disabled={loading}>
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Join Waitlist
                                        </Button>
                                    )}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Booking Details Modal */}
                        {selectedBooking && (
                            <BookingDetailsModal
                                booking={selectedBooking}
                                open={showDetailsModal}
                                onOpenChange={(open) => {
                                    setShowDetailsModal(open)
                                    if (!open) {
                                        // Refresh data after closing
                                        onWaitlistUpdate?.()
                                    }
                                }}
                                onSuccess={() => {
                                    setShowDetailsModal(false)
                                    // Refresh data after successful action
                                    onWaitlistUpdate?.()
                                }}
                            />
                        )}

                        {/* Management Modal (My Booking) */}
                        {isAdmin ? (
                            selectedBooking && (
                                <EditBookingDialog
                                    booking={selectedBooking}
                                    open={showManagementModal}
                                    onOpenChange={setShowManagementModal}
                                    onSuccess={() => window.location.reload()}
                                />
                            )
                        ) : (
                            <Dialog open={showManagementModal} onOpenChange={setShowManagementModal}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Manage Your Booking</DialogTitle>
                                    </DialogHeader>
                                    {selectedBooking && (
                                        <div className="py-4 space-y-6">
                                            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <CalendarPlus className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{selectedBooking.startTime} - {selectedBooking.endTime}</div>
                                                        <div className="text-xs text-muted-foreground">{date}</div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="capitalize">
                                                    {selectedBooking.status}
                                                </Badge>
                                            </div>

                                            {isEditing ? (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                                    <Label>New Duration</Label>
                                                    <div className="flex items-center gap-2">
                                                        {[1, 1.5, 2].map(dur => (
                                                            <Button
                                                                key={dur}
                                                                variant={editDuration === dur ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => setEditDuration(dur)}
                                                            >
                                                                {dur} Hour{dur > 1 ? 's' : ''}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        <Button className="flex-1" onClick={handleUpdateBooking} disabled={loading}>
                                                            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                                            Save Changes
                                                        </Button>
                                                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {!selectedBooking?.isOpenMatch ? (
                                                        <Button
                                                            className="h-20 flex flex-col gap-2 bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => {
                                                                setSelectedBooking(selectedBooking);
                                                                setShowManagementModal(false);
                                                                setShowConvertToOpenMatchModal(true);
                                                            }}
                                                        >
                                                            <Users className="w-5 h-5" />
                                                            <span>Make Open Match</span>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            className="h-20 flex flex-col gap-2"
                                                            onClick={() => {
                                                                const [start] = selectedBooking.startTime.split(':').map(Number);
                                                                const [end] = selectedBooking.endTime.split(':').map(Number);
                                                                setEditDuration(end - start);
                                                                setIsEditing(true);
                                                            }}
                                                        >
                                                            <Pencil className="w-5 h-5" />
                                                            <span>Edit Booking</span>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="destructive"
                                                        className="h-20 flex flex-col gap-2"
                                                        onClick={() => setShowDeleteConfirm(true)}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                        <span>Cancel Booking</span>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setShowManagementModal(false)}>
                                            Close
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Delete Confirmation */}
                        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will cancel your booking. You can't undo this action if someone else books the slot.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={loading}>Back</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={(e) => { e.preventDefault(); handleDeleteBooking(); }}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Yes, Cancel Booking
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {adminCreateSlot && (
                            <AdminCreateBookingDialog
                                open={showAdminCreate}
                                onOpenChange={setShowAdminCreate}
                                venueId={adminCreateSlot.venueId}
                                venueName={adminCreateSlot.venueName}
                                date={date}
                                startTime={adminCreateSlot.time}
                                onSuccess={() => {
                                    // The parent page (BookingsPage) has a socket listener that will refresh the data
                                }}
                            />
                        )}

                        {/* Open Match Modal */}
                        <Dialog open={showOpenMatchModal} onOpenChange={setShowOpenMatchModal}>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create Open Match</DialogTitle>
                                </DialogHeader>
                                <div className="py-6 space-y-6">
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <Users className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <p className="text-center text-sm text-muted-foreground">
                                        Select one of your existing bookings to convert it to an Open Match that others can join.
                                    </p>

                                    {/* Show user's bookings for today */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                            Your Bookings for {date}
                                        </h3>
                                        {bookings.filter(b => b.userId === user?.id && !b.isOpenMatch).length > 0 ? (
                                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                                {bookings.filter(b => b.userId === user?.id && !b.isOpenMatch).map(booking => (
                                                    <div
                                                        key={booking.id}
                                                        className="p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setShowOpenMatchModal(false);
                                                            setShowConvertToOpenMatchModal(true);
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="font-medium">{booking.Venue?.name || 'Venue'}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {booking.startTime} - {booking.endTime}
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline" className="capitalize">
                                                                {booking.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-sm text-muted-foreground">
                                                You don't have any bookings for today. Create a regular booking first, then convert it to an Open Match.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowOpenMatchModal(false)}>
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Convert to Open Match Modal */}
                        <Dialog open={showConvertToOpenMatchModal} onOpenChange={setShowConvertToOpenMatchModal}>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Convert to Open Match</DialogTitle>
                                </DialogHeader>
                                <div className="py-6 space-y-6">
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <Users className="w-8 h-8" />
                                        </div>
                                    </div>

                                    {selectedBooking && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <CalendarPlus className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{selectedBooking.Venue?.name || 'Venue'}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {selectedBooking.startTime} - {selectedBooking.endTime}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="capitalize">
                                                    {selectedBooking.status}
                                                </Badge>
                                            </div>

                                            <div className="space-y-3">
                                                <Label>Maximum Players</Label>
                                                <div className="flex items-center gap-2">
                                                    {[2, 4, 6, 8].map(num => (
                                                        <Button
                                                            key={num}
                                                            variant={openMatchMaxPlayers === num ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setOpenMatchMaxPlayers(num)}
                                                        >
                                                            {num} Players
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                <div className="text-sm font-medium text-green-800 flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    Open Match Features
                                                </div>
                                                <ul className="text-xs text-green-700 mt-2 space-y-1">
                                                    <li className="flex items-start gap-2">
                                                        <span className="mt-0.5">•</span>
                                                        <span>Other players can join your booking</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="mt-0.5">•</span>
                                                        <span>You remain the booking owner</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="mt-0.5">•</span>
                                                        <span>Cost is shared among all players</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter className="gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowConvertToOpenMatchModal(false);
                                            setSelectedBooking(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={async () => {
                                            if (!selectedBooking) return;
                                            setIsLoadingInternal(true);
                                            try {
                                                await onConvertToOpenMatch?.(selectedBooking.id as number, openMatchMaxPlayers);
                                                toast.success("Booking converted to Open Match!");
                                                setShowConvertToOpenMatchModal(false);
                                                setSelectedBooking(null);
                                            } catch (error: any) {
                                                toast.error(error.response?.data?.message || "Failed to convert to Open Match");
                                            } finally {
                                                setIsLoadingInternal(false);
                                            }
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Convert to Open Match
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </>
            )}
        </div>
    );
}
