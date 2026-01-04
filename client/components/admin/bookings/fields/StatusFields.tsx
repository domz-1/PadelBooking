"use client"

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { BookingStatus } from "@/lib/services/admin/bookingStatus.service"

interface StatusFieldsProps {
    form: UseFormReturn<any>
    statuses: BookingStatus[]
}

export function StatusFields({ form, statuses }: StatusFieldsProps) {
    return (
        <div className="w-full">
            <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Booking Status</FormLabel>
                        <Select
                            onValueChange={(v) => field.onChange(v === "none" ? undefined : Number(v))}
                            value={field.value ? String(field.value) : "none"}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">Standard / None</SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem key={status.id} value={String(status.id)}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: status.color }}
                                            />
                                            {status.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
