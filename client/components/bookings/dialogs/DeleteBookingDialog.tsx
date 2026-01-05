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
import { Loader2 } from "lucide-react";
import { useBookingStore } from "@/hooks/use-booking-store";
import { bookingService } from "@/lib/services/booking.service";
import { toast } from "sonner";

export function DeleteBookingDialog() {
    const {
        modals,
        selectedBooking,
        isLoading,
        setModalOpen,
        setIsLoading,
    } = useBookingStore();

    const isOpen = modals.deleteConfirm;

    const handleDeleteBooking = async () => {
        if (!selectedBooking?.id) return;
        setIsLoading(true);
        try {
            await bookingService.delete(selectedBooking.id);
            toast.success("Booking cancelled successfully");
            setModalOpen("deleteConfirm", false);
            setModalOpen("management", false); // Also close management if open
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to cancel booking";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(open) => setModalOpen("deleteConfirm", open)}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will cancel your booking. You cannot undo this action if
                        someone else books the slot.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Back</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDeleteBooking();
                        }}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Yes, Cancel Booking
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
