"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

export function TimePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}) {
  const [hour, setHour] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [isOpen, setIsOpen] = useState(false);

  // Initialize values from prop
  if (value) {
    const [h, m] = value.split(":");
    const hourNum = parseInt(h);
    const hour12 = hourNum % 12 || 12;
    const newPeriod = hourNum >= 12 ? "PM" : "AM";

    const newHour = hour12.toString().padStart(2, "0");
    const newMinute = m.padStart(2, "0");

    // Only set if different from current values
    if (hour !== newHour) setHour(newHour);
    if (minute !== newMinute) setMinute(newMinute);
    if (period !== newPeriod) setPeriod(newPeriod);
  }

  // Update parent when time changes
  useEffect(() => {
    if (hour && minute) {
      let hour24 = parseInt(hour);
      if (period === "PM" && hour24 < 12) hour24 += 12;
      if (period === "AM" && hour24 === 12) hour24 = 0;

      const timeString = `${hour24.toString().padStart(2, "0")}:${minute.padStart(2, "0")}`;
      onChange(timeString);
    }
  }, [hour, minute, period, onChange]);

  const incrementHour = () => {
    let newHour = (parseInt(hour) || 0) + 1;
    if (newHour > 12) newHour = 1;
    setHour(newHour.toString().padStart(2, "0"));
  };

  const decrementHour = () => {
    let newHour = (parseInt(hour) || 1) - 1;
    if (newHour < 1) newHour = 12;
    setHour(newHour.toString().padStart(2, "0"));
  };

  const incrementMinute = () => {
    let newMinute = (parseInt(minute) || 0) + 15;
    if (newMinute >= 60) newMinute = 0;
    setMinute(newMinute.toString().padStart(2, "0"));
  };

  const decrementMinute = () => {
    let newMinute = (parseInt(minute) || 0) - 15;
    if (newMinute < 0) newMinute = 45;
    setMinute(newMinute.toString().padStart(2, "0"));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? <span>{value}</span> : <span>Select time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-2">
          <div className="text-center text-sm font-medium">Select Time</div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{hour || "--"}</div>
              <div className="text-xs text-muted-foreground">Hour</div>
              <div className="flex gap-1 mt-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    incrementHour();
                  }}
                >
                  ▲
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    decrementHour();
                  }}
                >
                  ▼
                </Button>
              </div>
            </div>
            <div className="text-2xl">:</div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{minute || "--"}</div>
              <div className="text-xs text-muted-foreground">Minute</div>
              <div className="flex gap-1 mt-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    incrementMinute();
                  }}
                >
                  ▲
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    decrementMinute();
                  }}
                >
                  ▼
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Button
                size="sm"
                variant={period === "AM" ? "default" : "outline"}
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setPeriod("AM");
                }}
              >
                AM
              </Button>
              <Button
                size="sm"
                variant={period === "PM" ? "default" : "outline"}
                className="h-8 w-8 p-0 mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setPeriod("PM");
                }}
              >
                PM
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setHour("09");
                setMinute("00");
                setPeriod("AM");
              }}
            >
              9:00 AM
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setHour("12");
                setMinute("00");
                setPeriod("PM");
              }}
            >
              12:00 PM
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setHour("03");
                setMinute("00");
                setPeriod("PM");
              }}
            >
              3:00 PM
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setHour("06");
                setMinute("00");
                setPeriod("PM");
              }}
            >
              6:00 PM
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setHour("09");
                setMinute("00");
                setPeriod("PM");
              }}
            >
              9:00 PM
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setHour("12");
                setMinute("00");
                setPeriod("AM");
              }}
            >
              12:00 AM
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
