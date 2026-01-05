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
import { CalendarPlus, Loader2, Users } from "lucide-react";
import { useBookingStore } from "@/hooks/use-booking-store";
import { toast } from "sonner";

interface ConvertToOpenMatchDialogProps {
    onConvertToOpenMatch?: (bookingId: number, maxPlayers?: number) => void;
}

export function ConvertToOpenMatchDialog({ onConvertToOpenMatch }: ConvertToOpenMatchDialogProps) {
    const {
        modals,
        selectedBooking,
        openMatchMaxPlayers,
        isLoading,
        setModalOpen,
        setSelectedBooking,
        setOpenMatchMaxPlayers,
        setIsLoading,
    } = useBookingStore();

    const isOpen = modals.convertToOpenMatch;

    const handleConvert = async () => {
        if (!selectedBooking) return;
        setIsLoading(true);
        try {
            await onConvertToOpenMatch?.(
                selectedBooking.id as number,
                openMatchMaxPlayers,
            );
            toast.success("Booking converted to Open Match!");
            setModalOpen("convertToOpenMatch", false);
            setSelectedBooking(null);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to convert to Open Match";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => setModalOpen("convertToOpenMatch", open)}
        >
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
                                        <div className="font-semibold">
                                            {selectedBooking.Venue?.name || "Venue"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {selectedBooking.startTime} -{" "}
                                            {selectedBooking.endTime}
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
                                    {[2, 4, 6, 8].map((num) => (
                                        <Button
                                            key={num}
                                            variant={
                                                openMatchMaxPlayers === num ? "default" : "outline"
                                            }
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
                            setModalOpen("convertToOpenMatch", false);
                            setSelectedBooking(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleConvert}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Convert to Open Match
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
