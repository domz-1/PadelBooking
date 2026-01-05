import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useBookingStore } from "@/hooks/use-booking-store";
import { Booking } from "@/lib/schemas";
import { useAuthStore } from "@/hooks/use-auth-store";

interface OpenMatchDialogProps {
    date: string;
    bookings: Booking[];
}

export function OpenMatchDialog({ date, bookings }: OpenMatchDialogProps) {
    const { modals, setModalOpen, setSelectedBooking } = useBookingStore();
    const { user } = useAuthStore();

    const isOpen = modals.openMatch;

    const myBookings = bookings.filter(
        (b) => b.userId === user?.id && !b.isOpenMatch
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => setModalOpen("openMatch", open)}>
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
                        Select one of your existing bookings to convert it to an Open Match
                        that others can join.
                    </p>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Your Bookings for {date}
                        </h3>
                        {myBookings.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {myBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                                        onClick={() => {
                                            setSelectedBooking(booking);
                                            setModalOpen("openMatch", false);
                                            setModalOpen("convertToOpenMatch", true);
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-medium">
                                                    {booking.Venue?.name || "Venue"}
                                                </div>
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
                                You do not have any bookings for today. Create a regular booking
                                first, then convert it to an Open Match.
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setModalOpen("openMatch", false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
