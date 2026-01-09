"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

export type DatePickerProps = Omit<React.ComponentProps<typeof Calendar>, "mode" | "selected" | "onSelect"> & {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    placeholder?: string
}

export function DatePicker({ date, setDate, placeholder = "Pick a date", className, ...props }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 flex flex-col" align="end">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    {...props}
                />
                <div className="p-3 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-xs font-semibold bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                        onClick={() => {
                            const today = new Date();
                            today.setHours(12, 0, 0, 0);
                            setDate(today);
                        }}
                    >
                        Today
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
