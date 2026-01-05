import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock, Loader2 } from "lucide-react";
import { useBookingStore } from "@/hooks/use-booking-store";
import { bookingService } from "@/lib/services/booking.service";
import { toast } from "sonner";
import { WaitlistEntry } from "@/lib/schemas";

interface WaitlistDialogProps {
    date: string;
    waitlistEntries: WaitlistEntry[];
    onWaitlistUpdate?: () => void;
}

export function WaitlistDialog({ date, waitlistEntries, onWaitlistUpdate }: WaitlistDialogProps) {
    const {
        modals,
        setModalOpen,
        slotInfo,
        isLoading,
        setIsLoading
    } = useBookingStore();

    const isOpen = modals.waitlist;

    const getWaitlistEntry = (venueId: number, hour: number) => {
        const timeStr = hour.toString().padStart(2, "0") + ":00";
        return waitlistEntries.find((w) => {
            if (Number(w.venueId) !== Number(venueId)) return false;
            if (w.date !== date) return false;
            const wTime = w.startTime.substring(0, 5);
            return wTime === timeStr;
        });
    };

    const handleJoinWaitlist = async () => {
        if (!slotInfo) return;
        setIsLoading(true);
        try {
            const [hour] = slotInfo.time.split(":").map(Number);
            const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

            await bookingService.joinWaitlist({
                venueId: slotInfo.venueId,
                date,
                startTime: slotInfo.time,
                endTime,
            });
            toast.success(
                "Joined waitlist! You will be notified if this slot becomes available.",
            );
            setModalOpen("waitlist", false);
            onWaitlistUpdate?.();
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to join waitlist";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveWaitlist = async () => {
        if (!slotInfo) return;

        // Calculate entry again or pass it? Logic repeated for safety
        const entry = getWaitlistEntry(
            slotInfo.venueId,
            parseInt(slotInfo.time.split(":")[0]),
        );

        if (!entry?.id) return;
        setIsLoading(true);
        try {
            await bookingService.leaveWaitlist(entry.id);
            toast.success("Left waitlist!");
            setModalOpen("waitlist", false);
            onWaitlistUpdate?.();
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to leave waitlist";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const isWaitlisted = slotInfo && getWaitlistEntry(
        slotInfo.venueId,
        parseInt(slotInfo.time.split(":")[0])
    );

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => setModalOpen("waitlist", open)}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isWaitlisted
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
                        {isWaitlisted
                            ? "You are currently on the waitlist for this slot. Are you sure you want to leave the waitlist?"
                            : "This slot is currently fully booked. Would you like to join the waitlist? We will notify you immediately if it becomes available."}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="p-3 bg-secondary/50 rounded-lg">
                            <Label className="text-[10px] uppercase text-muted-foreground">
                                Time
                            </Label>
                            <div className="text-sm font-semibold">
                                {slotInfo?.time}
                            </div>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                            <Label className="text-[10px] uppercase text-muted-foreground">
                                Date
                            </Label>
                            <div className="text-sm font-semibold">{date}</div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setModalOpen("waitlist", false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    {isWaitlisted ? (
                        <Button
                            variant="destructive"
                            onClick={handleLeaveWaitlist}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Leave Waitlist
                        </Button>
                    ) : (
                        <Button onClick={handleJoinWaitlist} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Join Waitlist
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
