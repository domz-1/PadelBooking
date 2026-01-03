"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { metricsService } from "@/lib/services/admin/metrics.service";
import { adminBranchService } from "@/lib/services/admin/branches.service";
import type { Branch } from "@/lib/schemas";
import { format } from "date-fns";

export function EmptySlotsBoard() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("23:00");
    const [branchId, setBranchId] = useState<string>("all");

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const data = await adminBranchService.getAll();
            setBranches(data);
        } catch (error) {
            console.error("Failed to load branches", error);
        }
    };

    const handleCopy = async () => {
        setLoading(true);
        try {
            const res = await metricsService.getAvailableSlots({
                date,
                startTime,
                endTime,
                branchId: branchId === "all" ? undefined : parseInt(branchId)
            });

            const slots = res.data;
            let text = `🎾 *Available Padel Slots for ${date}*\n`;
            text += `⏰ Range: ${startTime} - ${endTime}\n\n`;

            let hasSlots = false;
            for (const [branch, venues] of Object.entries(slots)) {
                let branchText = `📍 *${branch}*\n`;
                let branchHasSlots = false;

                for (const [venue, times] of Object.entries(venues)) {
                    const typedTimes = times as { start: string; end: string }[];
                    if (typedTimes.length > 0) {
                        branchHasSlots = true;
                        hasSlots = true;
                        branchText += `  - ${venue}: ${typedTimes.map((t: { start: string; end: string }) => `${t.start}-${t.end}`).join(", ")}\n`;
                    }
                }

                if (branchHasSlots) {
                    text += branchText + "\n";
                }
            }

            if (!hasSlots) {
                toast.info("No empty slots found for this criteria.");
                return;
            }

            text += "Book now via our app!";
            await navigator.clipboard.writeText(text);
            toast.success("Available slots copied to clipboard!");
        } catch (error) {
            toast.error("Failed to fetch available slots");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-lg border-2 border-primary/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Empty Slots Board
                </CardTitle>
                <CardDescription>
                    Quickly find and copy formatted lists of available slots to share with players.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <div className="relative">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-10"
                            />
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Branch</Label>
                        <Select value={branchId} onValueChange={setBranchId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Branch" />
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

                <Button
                    onClick={handleCopy}
                    disabled={loading}
                    className="w-full mt-2"
                    variant="default"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy Formatted Slots
                </Button>
            </CardContent>
        </Card>
    );
}
