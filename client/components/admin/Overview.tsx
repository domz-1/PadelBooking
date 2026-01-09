"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO, isValid } from "date-fns";

interface OverviewProps {
  data: { day: string; count?: number | string; value?: number | string }[];
}

export function Overview({ data = [] }: OverviewProps) {
  const getValue = (item: {
    count?: number | string;
    value?: number | string;
  }) => {
    const rawValue = item?.count ?? item?.value ?? 0;
    const parsed =
      typeof rawValue === "string" ? parseFloat(rawValue) : rawValue;
    return isFinite(parsed) ? parsed : 0;
  };

  const safeData = Array.isArray(data) ? data : [];
  const maxVal = Math.max(...safeData.map((d) => getValue(d)), 5);

  return (
    <Card className="col-span-4 border-none shadow-none p-0 bg-transparent h-full">
      <CardContent className="p-0 h-full">
        <div className="h-full w-full flex items-end gap-1 px-1 pb-14 pt-8">
          {safeData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground italic text-xs">
              No data available for the selected period
            </div>
          ) : (
            safeData.map((item, i) => {
              const val = getValue(item);
              const height = (val / maxVal) * 100;
              const safeHeight = Math.max(height, 2); // Minimum 2% height for visibility

              let dayLabel = item.day;
              if (/^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
                try {
                  const date = parseISO(item.day);
                  if (isValid(date)) {
                    dayLabel = format(date, "MMM d");
                  }
                } catch (e) {
                  console.error("Date formatting error", e);
                }
              }

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center group h-full min-w-[4px] relative"
                >
                  <div className="flex-1 w-full flex items-end relative">
                    <div
                      className="w-full bg-primary/20 group-hover:bg-primary transition-all rounded-t-[1px] relative min-h-[2px]"
                      style={{ height: `${safeHeight}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap z-30 pointer-events-none transition-all">
                        {Math.round(val * 10) / 10}{" "}
                        {item.value !== undefined ? "%" : ""}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
                      </div>
                    </div>
                  </div>
                  {/* Vertical bottom labels */}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 h-12 flex items-center justify-center">
                    <span className="text-[7px] text-zinc-400 font-black uppercase tracking-tighter -rotate-90 whitespace-nowrap origin-center">
                      {dayLabel}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
