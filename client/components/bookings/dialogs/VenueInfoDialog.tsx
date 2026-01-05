import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useBookingStore } from "@/hooks/use-booking-store";

export function VenueInfoDialog() {
    const { selectedVenue, modals, setSelectedVenue, setModalOpen } = useBookingStore();
    const isOpen = !!selectedVenue; // Logic from original: open={!!selectedVenue} based on state presence, but let's align with store or keep as is.
    // Actually, original logic was implicit `open={!!selectedVenue}`. 
    // Let's stick to explicit `modals.venueInfo` if we want full control, OR
    // strictly follow the original behavior: if internal state `selectedVenue` is set, show modal.
    // BUT the store has `setModalOpen`. Let's use `selectedVenue` existence as the trigger to match original simplified logic
    // OR better: use `modals.venueInfo` and have the grid set it to true when clicking.
    // Wait, original code: `onClick={() => setSelectedVenue(venue)}`
    // `Dialog open={!!selectedVenue}`.
    // So we can just use `selectedVenue` as the truth.

    const handleOpenChange = (open: boolean) => {
        if (!open) setSelectedVenue(null);
    };

    if (!selectedVenue) return null;

    return (
        <Dialog open={!!selectedVenue} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{selectedVenue?.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs text-gray-500 block">Type</span>
                            <span className="font-medium">
                                {selectedVenue?.type || "Standard"}
                            </span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs text-gray-500 block">
                                Price / Hour
                            </span>
                            <span className="font-medium text-brand-600">
                                ${selectedVenue?.pricePerHour}
                            </span>
                        </div>
                    </div>
                    {selectedVenue?.Branch && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs text-gray-500 block">
                                Branch
                            </span>
                            <span className="font-medium">
                                {selectedVenue.Branch.name}
                            </span>
                            <span className="text-xs text-gray-400 block mt-0.5">
                                {selectedVenue.Branch.location}
                            </span>
                        </div>
                    )}
                    {selectedVenue?.description && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs text-gray-500 block">
                                Description
                            </span>
                            <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                                {selectedVenue.description}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
