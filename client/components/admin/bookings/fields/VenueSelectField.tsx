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

interface VenueSelectFieldProps {
  form: UseFormReturn<any>;
  venues: { id: number; name: string }[];
}

export function VenueSelectField({ form, venues }: VenueSelectFieldProps) {
  return (
    <FormField
      control={form.control}
      name="venueId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Venue (Court)</FormLabel>
          <Select
            onValueChange={(val) => field.onChange(Number(val))}
            value={field.value ? String(field.value) : undefined}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {venues.map((v) => (
                <SelectItem key={v.id} value={String(v.id)}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
