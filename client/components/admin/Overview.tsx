"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface OverviewProps {
    data: { day: string; count?: number; value?: number }[];
}

export function Overview({ data }: OverviewProps) {
    const getValue = (item: any) => {
        return parseInt((item.count ?? item.value ?? 0).toString());
    };

    const maxVal = Math.max(...data.map(d => getValue(d)), 5);

    return (
        <Card className="col-span-4 border-none shadow-none p-0">
            <CardContent className="p-0">
                <div className="h-[250px] w-full flex items-end gap-2 pt-4">
                    {data.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground italic">
                            No data available for the selected period
                        </div>
                    ) : (
                        data.map((item, i) => {
                            const val = getValue(item);
                            const height = (val / maxVal) * 100;
                            const dayName = /^\d{4}-\d{2}-\d{2}$/.test(item.day)
                                ? new Date(item.day).toLocaleDateString("en-US", { weekday: "short" })
                                : item.day;

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="flex-1 w-full flex items-end">
                                        <div
                                            className="w-full bg-primary/20 group-hover:bg-primary/40 transition-all rounded-t-sm relative"
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md border whitespace-nowrap z-10 transition-all">
                                                {val} {item.value !== undefined ? '%' : 'Bookings'}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-medium">{dayName}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
