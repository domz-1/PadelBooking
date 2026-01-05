import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Loader2, Pencil, Trash2, Users } from "lucide-react";
import { useBookingStore } from "@/hooks/use-booking-store";
import { bookingService } from "@/lib/services/booking.service";
import { toast } from "sonner";

interface ManageBookingDialogProps {
    date: string;
}

export function ManageBookingDialog({ date }: ManageBookingDialogProps) {
    const {
        modals,
        selectedBooking,
        isEditing,
        editDuration,
        isLoading,
        setModalOpen,
        setSelectedBooking,
        setIsEditing,
        setEditDuration,
        setIsLoading,
    } = useBookingStore();

    const isOpen = modals.management;

    const handleUpdateBooking = async () => {
        if (!selectedBooking?.id) return;
        setIsLoading(true);
        try {
            const [hour] = selectedBooking.startTime.split(":").map(Number);
            const endHour = hour + editDuration;
            const endTime = `${Math.floor(endHour).toString().padStart(2, "0")}:${((endHour % 1) * 60).toString().padStart(2, "0")}`;

            await bookingService.update(selectedBooking.id, {
                endTime,
            });
            toast.success("Booking updated!");
            setModalOpen("management", false);
            setIsEditing(false);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to update booking";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteConfirm = () => {
        // Keep management open? logic suggests delete confirm is on top or replaces it.
        // In original code: onClick={() => setShowDeleteConfirm(true)}
        // It keeps management open underneath usually, or we can close management.
        // Let's open delete confirm.
        setModalOpen("deleteConfirm", true);
    };

    if (!selectedBooking) return null;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => setModalOpen("management", open)}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Your Booking</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    {/* Booking Summary */}
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <CalendarPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold">
                                    {selectedBooking.startTime} - {selectedBooking.endTime}
                                </div>
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
                                {[1, 1.5, 2].map((dur) => (
                                    <Button
                                        key={dur}
                                        variant={editDuration === dur ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setEditDuration(dur)}
                                    >
                                        {dur} Hour{dur > 1 ? "s" : ""}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    className="flex-1"
                                    onClick={handleUpdateBooking}
                                    disabled={isLoading}
                                >
                                    {isLoading && (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {!selectedBooking?.isOpenMatch ? (
                                <Button
                                    className="h-20 flex flex-col gap-2 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => {
                                        // Transition to Open Match Modal
                                        // setModalOpen("management", false); // Optional: close this one
                                        setModalOpen("convertToOpenMatch", true);
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
                                        const [start] = selectedBooking.startTime
                                            .split(":")
                                            .map(Number);
                                        const [end] = selectedBooking.endTime
                                            .split(":")
                                            .map(Number);
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
                                onClick={openDeleteConfirm}
                            >
                                <Trash2 className="w-5 h-5" />
                                <span>Cancel Booking</span>
                            </Button>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setModalOpen("management", false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
