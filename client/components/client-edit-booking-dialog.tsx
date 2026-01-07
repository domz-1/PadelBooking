"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Booking, Venue } from "@/lib/types";
import { toast } from "sonner";
import api from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ClientEditBookingDialogProps {
    booking: Booking;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ClientEditBookingDialog({
    booking,
    open,
    onOpenChange,
    onSuccess,
}: ClientEditBookingDialogProps) {
    const [loading, setLoading] = useState(false);
    const [startTime, setStartTime] = useState(booking.startTime.slice(0, 5));
    const [endTime, setEndTime] = useState(booking.endTime.slice(0, 5));
    const [date, setDate] = useState<Date | undefined>(new Date(booking.date));
    const [venues, setVenues] = useState<Venue[]>([]);
    const [venueId, setVenueId] = useState<string>(booking.venueId.toString());

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const res = await api.get('/venues');
                if (res.data.success) {
                    setVenues(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch venues", error);
            }
        };

        if (open) {
            fetchVenues();
        }
    }, [open]);

    const handleSave = async () => {
        if (!date) {
            toast.error("Please select a date");
            return;
        }

        setLoading(true);
        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            const res = await api.put(`/bookings/${booking.id}`, {
                date: formattedDate,
                startTime,
                endTime,
                venueId: parseInt(venueId),
            });

            if (res.data.success) {
                toast.success("Booking updated successfully");
                onSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            const errorMsg = err.response?.data?.message || "Failed to update booking";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Booking</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Venue</Label>
                        <Select value={venueId} onValueChange={setVenueId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a venue" />
                            </SelectTrigger>
                            <SelectContent>
                                {venues.map((venue) => (
                                    <SelectItem key={venue.id} value={venue.id.toString()}>
                                        {venue.name} {venue.Branch?.name ? `(${venue.Branch.name})` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <div className="relative">
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="pl-9"
                                />
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <div className="relative">
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="pl-9"
                                />
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
