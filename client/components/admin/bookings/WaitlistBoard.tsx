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
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { Loader2, User, MapPin, Clock, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { adminApi } from "@/lib/api";
import { socketService } from "@/lib/socket";

interface WaitlistEntry {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    notified: boolean;
    User?: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    Venue?: {
        id: number;
        name: string;
    };
}

interface WaitlistBoardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialDate: string;
}

export function WaitlistBoard({
    open,
    onOpenChange,
    initialDate,
}: WaitlistBoardProps) {
    const [date, setDate] = useState<Date>(new Date());
    const [entries, setEntries] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && initialDate) {
            setDate(new Date(initialDate));
        }
    }, [open, initialDate]);

    const fetchWaitlist = useCallback(async () => {
        if (!open) return;

        setLoading(true);
        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            const response = await adminApi.get(`/bookings/waitlist/daily`, {
                params: { date: formattedDate }
            });

            if (response.data.success) {
                setEntries(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch waitlist:", error);
            toast.error("Failed to fetch waitlist entries");
        } finally {
            setLoading(false);
        }
    }, [open, date]);

    useEffect(() => {
        if (open) {
            fetchWaitlist();

            const socket = socketService.getSocket();
            if (socket) {
                socket.on("waitlistUpdate", fetchWaitlist);
            }

            return () => {
                if (socket) {
                    socket.off("waitlistUpdate", fetchWaitlist);
                }
            };
        }
    }, [open, fetchWaitlist]);

    const formatH = (time: string) => {
        const [h, m] = time.split(':');
        const hh = parseInt(h);
        const ampm = hh >= 12 ? 'pm' : 'am';
        const h12 = hh % 12 || 12;
        return `${h12}:${m}${ampm}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Waitlist Board</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Viewing all waitlist entries for the selected day.
                    </p>
                </DialogHeader>

                <div className="py-4 space-y-6 flex-1 overflow-y-auto pr-2">
                    <div className="grid gap-2">
                        <Label>Selected Date</Label>
                        <div className="w-full sm:w-[240px]">
                            <DatePicker date={date} setDate={(d) => d && setDate(d)} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                                <p className="text-muted-foreground">No waitlist entries found for this date.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {entries.map((entry) => (
                                    <div key={entry.id} className="p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 font-semibold text-lg">
                                                    <User className="w-4 h-4 text-primary" />
                                                    {entry.User?.name || 'Unknown User'}
                                                </div>
                                                <div className="grid gap-1 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {entry.User?.phone || 'No phone'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {entry.User?.email || 'No email'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 text-sm">
                                                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {entry.Venue?.name || 'Unknown Court'}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatH(entry.startTime)} - {formatH(entry.endTime)}
                                                </div>
                                                {entry.notified && (
                                                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded">
                                                        Notified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Close
                    </Button>
                    <Button onClick={fetchWaitlist} variant="secondary" className="w-full sm:w-auto">
                        Refresh
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
