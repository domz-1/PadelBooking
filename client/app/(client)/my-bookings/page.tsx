
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Booking } from "@/lib/models";
import { useAuthStore } from "@/hooks/use-auth-store";
import { format } from "date-fns";
import { Calendar, Clock, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings/my-bookings');
            if (res.data.success) {
                setBookings(res.data.data);
            }
        } catch {
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

    const cancelBooking = async (id: number) => {
        try {
            const res = await api.delete(`/bookings/${id}`);
            if (res.data.success) {
                toast.success("Booking cancelled");
                fetchBookings(); // Refresh list
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel booking");
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                <p className="text-muted-foreground mt-1">Manage your upcoming and past bookings.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            You have no bookings yet.
                        </div>
                    ) : bookings.map((booking) => (
                        <Card key={booking.id}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{booking.Venue?.name || 'Venue'}</CardTitle>
                                        <CardDescription>{booking.type} booking</CardDescription>
                                    </div>
                                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                        {booking.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                                </div>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                                </div>

                                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                    <div className="pt-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" className="w-full">
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Cancel Booking
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently cancel your booking.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => cancelBooking(booking.id)} className="bg-red-600 hover:bg-red-700">
                                                        Yes, Cancel Booking
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
