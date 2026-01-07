"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Booking } from "@/lib/types";
import { useAuthStore } from "@/hooks/use-auth-store";
import { format, isPast } from "date-fns";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ClientEditBookingDialog } from "@/components/client-edit-booking-dialog";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    // State for dialogs
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [cancelingBookingId, setCancelingBookingId] = useState<number | null>(null);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings/my-bookings');
            if (res.data.success) {
                setBookings(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
            toast.error('Failed to fetch your bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        fetchBookings();
    }, [isAuthenticated, router]);

    const handleCancelBooking = async () => {
        if (!cancelingBookingId) return;
        try {
            const res = await api.delete(`/bookings/${cancelingBookingId}`);
            if (res.data.success) {
                toast.success("Booking cancelled");
                fetchBookings(); // Refresh list
            }
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast.error(err.response?.data?.message || "Failed to cancel booking");
        } finally {
            setCancelingBookingId(null);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="container max-w-6xl mx-auto py-8 space-y-8">
            <Breadcrumbs items={[{ label: "My Bookings", active: true }]} />
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                <p className="text-muted-foreground mt-1">Manage your upcoming and past bookings.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            You have no bookings yet.
                        </div>
                    ) : bookings.map((booking) => {
                        const bookingDateTime = new Date(booking.date);
                        const [hours, minutes] = booking.startTime.split(':');
                        bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
                        const isPastBooking = isPast(bookingDateTime);

                        return (
                            <div
                                key={booking.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4 bg-card text-card-foreground shadow-sm"
                            >
                                <div className="space-y-1">
                                    <div className="font-semibold flex items-center gap-2">
                                        {booking.Venue?.name || 'Venue'}
                                        {isPastBooking ? (
                                            <Badge variant="secondary" className="text-[10px]">Past</Badge>
                                        ) : (
                                            <Badge variant="default" className="text-[10px] bg-green-600 hover:bg-green-700">Upcoming</Badge>
                                        )}
                                        {booking.status === 'cancelled' && <Badge variant="destructive" className="text-[10px]">Cancelled</Badge>}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(booking.date), 'MMM d, yyyy')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    {!isPastBooking && booking.status !== 'cancelled' && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingBooking(booking)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setCancelingBookingId(booking.id)}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {editingBooking && (
                <ClientEditBookingDialog
                    booking={editingBooking}
                    open={!!editingBooking}
                    onOpenChange={(open) => !open && setEditingBooking(null)}
                    onSuccess={fetchBookings}
                />
            )}

            <AlertDialog open={!!cancelingBookingId} onOpenChange={() => setCancelingBookingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently cancel your booking.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelBooking} className="bg-red-600 hover:bg-red-700">
                            Yes, Cancel Booking
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
