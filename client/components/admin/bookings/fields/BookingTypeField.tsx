"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface BookingTypeFieldProps {
  form: UseFormReturn<{
    date: Date;
    startTime: string;
    endTime: string;
    totalPrice: number;
    userId: number;
    venueId: number;
    statusId?: number;
    type: "standard" | "academy";
    hasOffer: boolean;
    offerValue: number;
    notes?: string;
  }>;
}

export function BookingTypeField({ form }: BookingTypeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Booking Type</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="academy">Academy</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
