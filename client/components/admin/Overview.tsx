"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface OverviewProps {
  data: { day: string; count?: number; value?: number }[];
}

export function Overview({ data }: OverviewProps) {
  const getValue = (item: { day: string; count?: number; value?: number }) => {
    const rawValue = item.count ?? item.value ?? 0;
    const parsed = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
    return isNaN(parsed) ? 0 : parsed;
  };

  const maxVal = Math.max(...data.map((d) => getValue(d)), 5);

  return (
    <Card className="col-span-4 border-none shadow-none p-0 bg-transparent">
      <CardContent className="p-0">
        <div className="h-[250px] w-full flex items-end gap-1.5 pt-8">
          {data.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground italic text-xs">
              No data available for the selected period
            </div>
          ) : (
            data.map((item, i) => {
              const val = getValue(item);
              const height = Math.max((val / maxVal) * 100, 2); // Minimum 2% height for visibility
              const dayName = /^\d{4}-\d{2}-\d{2}$/.test(item.day)
                ? format(new Date(item.day), "MMM d")
                : item.day;

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-3 group"
                >
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full bg-primary/30 group-hover:bg-primary transition-all rounded-t-[2px] relative"
                      style={{ height: `${height}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1.5 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none transition-all scale-95 group-hover:scale-100">
                        {Math.round(val * 10) / 10} {item.value !== undefined ? "%" : "Bookings"}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                    {dayName}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
