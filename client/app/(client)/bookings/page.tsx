
"use client";

import { useEffect, useState, useCallback } from "react";
import BookingGrid from "@/components/bookings/BookingGrid";
import api from "@/lib/api";
import { format } from "date-fns";
import { Venue, Booking } from "@/lib/models";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { ClientPage } from "@/components/wrapper/ClientPage";

export default function BookingsPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [venues, setVenues] = useState<Venue[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Booking Modal State
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ venueId: number, time: string } | null>(null);
    const [bookingDuration, setBookingDuration] = useState(1); // Hours

    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    const formattedDate = format(date, "yyyy-MM-dd");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Parallel fetch
            const [venuesRes, bookingsRes] = await Promise.all([
                api.get("/venues"),
                api.get(`/bookings?date=${formattedDate}&limit=100`) // Assuming limit=100 is enough for grid
            ]);

            if (venuesRes.data.success) {
                setVenues(venuesRes.data.data);
            }

            if (bookingsRes.data.success) {
                setBookings(bookingsRes.data.data);
            }

        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Could not load schedule");
        } finally {
            setLoading(false);
        }
    }, [formattedDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateBooking = (venueId: number, time: string) => {
        if (!isAuthenticated) {
            toast.info("Please login to book a court");
            router.push("/auth/login");
            return;
        }
        setSelectedSlot({ venueId, time });
        setShowBookingModal(true);
    };

    const confirmBooking = async () => {
        if (!selectedSlot) return;

        try {
            const [hour] = selectedSlot.time.split(':').map(Number);
            const endHour = hour + bookingDuration;
            const endTime = `${endHour.toString().padStart(2, '0')}:00`;

            const payload = {
                venueId: selectedSlot.venueId,
                date: formattedDate,
                startTime: selectedSlot.time,
                endTime: endTime,
            };

            const res = await api.post("/bookings", payload);
            if (res.data.success) {
                toast.success("Booking created successfully!");
                setShowBookingModal(false);
                fetchData(); // Refresh grid
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create booking");
        }
    };

    return (
        <ClientPage
            title="Court Schedule"
            description="View availability and book your slot."
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    {/* Header moved to ClientPage props */}
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d: Date | undefined) => {
                                if (d) {
                                    // Adjust for timezone offset to ensure "YYYY-MM-DD" matches selected day
                                    // Or simply set to noon to avoid midnight shifts
                                    const newDate = new Date(d);
                                    newDate.setHours(12, 0, 0, 0);
                                    setDate(newDate);
                                }
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                </div>
            ) : (
                <BookingGrid
                    venues={venues}
                    bookings={bookings}
                    date={formattedDate}
                    onCreateBooking={handleCreateBooking}
                    onViewBooking={(booking) => console.log(booking)}
                    publicView={!isAuthenticated}
                />
            )}

            {/* Create Booking Confirmation Modal */}
            <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Booking</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Date</Label>
                                <div className="text-sm font-medium mt-1">{formattedDate}</div>
                            </div>
                            <div>
                                <Label>Start Time</Label>
                                <div className="text-sm font-medium mt-1">{selectedSlot?.time}</div>
                            </div>
                        </div>
                        <div>
                            <Label>Duration</Label>
                            <div className="flex items-center gap-2 mt-2">
                                {[1, 1.5, 2].map(dur => (
                                    <Button
                                        key={dur}
                                        variant={bookingDuration === dur ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setBookingDuration(dur)}
                                    >
                                        {dur} Hour{dur > 1 ? 's' : ''}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBookingModal(false)}>Cancel</Button>
                        <Button onClick={confirmBooking}>Confirm Booking</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ClientPage>
    );
}
