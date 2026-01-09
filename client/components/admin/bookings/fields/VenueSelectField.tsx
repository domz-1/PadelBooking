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
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface VenueSelectFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  venues: { id: number; name: string }[];
}

export function VenueSelectField<T extends FieldValues>({ form, venues }: VenueSelectFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={"venueId" as Path<T>}
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
