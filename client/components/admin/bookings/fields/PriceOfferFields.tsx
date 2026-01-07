"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";

interface PriceOfferFieldsProps {
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

export function PriceOfferFields({ form }: PriceOfferFieldsProps) {
  const hasOffer = form.watch("hasOffer");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="totalPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Price (EGP)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4 p-4 bg-background/20  shadow-sm rounded-lg">
        <FormField
          control={form.control}
          name="hasOffer"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel>Special Offer</FormLabel>
                <div className="text-[10px] text-muted-foreground">
                  Apply custom discount
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {hasOffer && (
          <FormField
            control={form.control}
            name="offerValue"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-top-2">
                <FormLabel>Offer Amount (EGP)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
