"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { Copy, ClipboardCheck, Loader2 } from "lucide-react";
import type { Venue, Branch } from "@/lib/schemas";
import { addDays, format } from "date-fns";
import { adminApi } from "@/lib/api";
import { useBranding } from "@/components/providers/BrandingProvider";

interface EmptySlotsBoardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    venues: Venue[]; // Still used for internal filtering if needed but mostly for metadata
    branches: Branch[];
    initialDate: string;
}

export function EmptySlotsBoard({
    open,
    onOpenChange,
    branches,
    initialDate,
}: EmptySlotsBoardProps) {
    const { brandName } = useBranding();
    // Default values: Today 5 PM to Tomorrow 3 AM
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 1));
    const [startTime, setStartTime] = useState("17"); // 5pm
    const [endTime, setEndTime] = useState("03"); // 3am

    const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
    const [freeSlotsData, setFreeSlotsData] = useState<Record<string, string[]> | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Sync initial date only if it's different from today (optional, but keeping it simple)
    useEffect(() => {
        if (open && initialDate) {
            const d = new Date(initialDate);
            if (format(d, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd")) {
                setStartDate(d);
                setEndDate(addDays(d, 1));
            }
        }
    }, [open, initialDate]);

    const fetchFreeSlots = useCallback(async () => {
        if (!open) return;

        setLoading(true);
        try {
            const sDate = format(startDate, "yyyy-MM-dd");
            const eDate = format(endDate, "yyyy-MM-dd");

            const response = await adminApi.get(`/bookings/free-slots`, {
                params: {
                    startDate: sDate,
                    startTime,
                    endDate: eDate,
                    endTime,
                    branchId: selectedBranchId
                }
            });

            if (response.data.success) {
                setFreeSlotsData(response.data.data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch free slots:", error);
            toast.error("Failed to calculate free slots from backend");
        } finally {
            setLoading(false);
        }
    }, [open, startDate, endDate, startTime, endTime, selectedBranchId]);

    useEffect(() => {
        if (open) {
            fetchFreeSlots();
        }
    }, [open, fetchFreeSlots]);

    const formatHourLabel = (h: number) => {
        const hh = h % 24;
        const ampm = (hh >= 12 && hh < 24) ? "pm" : "am";
        const h12 = hh % 12 || 12;
        if (h === 24) return "12am";
        return `${h12}${ampm}`;
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const timeOptions = hours.map((h) => ({
        label: formatHourLabel(h),
        value: h.toString().padStart(2, "0"),
    }));

    const handleCopy = () => {
        if (!freeSlotsData || Object.keys(freeSlotsData).length === 0) {
            toast.info("No empty slots found for the selected criteria.");
            return;
        }

        const bookingUrl = typeof window !== "undefined" ? `${window.location.origin}/bookings` : "";
        const updateTime = lastUpdated ? format(lastUpdated, "h:mm a") : format(new Date(), "h:mm a");

        let text = `*🎾 ${brandName} - Available Padel Slots*\n`;
        text += `_Last update: ${updateTime}_\n\n`;

        Object.entries(freeSlotsData).forEach(([venueName, ranges]) => {
            text += `*📍 ${venueName}:*\n`;
            text += `   ${ranges.join(", ")}\n\n`;
        });

        text += `*🔗 Book your slot now:*\n${bookingUrl}`;

        navigator.clipboard.writeText(text.trim());
        setCopied(true);
        toast.success("Formatted slots copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Empty Slots Board</DialogTitle>
                        {lastUpdated && (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full">
                                Update: {format(lastUpdated, "h:mm a")}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Calculate available slots from backend with your custom range.
                    </p>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <div className="w-full">
                                <DatePicker date={startDate} setDate={(d) => d && setStartDate(d)} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>End Date</Label>
                            <div className="w-full">
                                <DatePicker date={endDate} setDate={(d) => d && setEndDate(d)} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid gap-2">
                            <Label>Start Time</Label>
                            <Select value={startTime} onValueChange={setStartTime}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Start" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeOptions.map((opt) => (
                                        <SelectItem key={`start-${opt.value}`} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>End Time</Label>
                            <Select value={endTime} onValueChange={setEndTime}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="End" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeOptions.map((opt) => (
                                        <SelectItem key={`end-${opt.value}`} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Branch</Label>
                        <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Branches" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Branches</SelectItem>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={b.id.toString()}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={handleCopy} disabled={loading} className="gap-2">
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : copied ? (
                            <ClipboardCheck className="w-4 h-4" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                        Copy Formatted Slots
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
