"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addHours, parse } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

import { useBookingData } from "@/hooks/useBookingData";
import { useBookingOperations } from "@/hooks/useBookingOperations";
import { VenueSelectField } from "./fields/VenueSelectField";
import { UserSelectField } from "./fields/UserSelectField";
import { StatusFields } from "./fields/StatusFields";
import { PriceOfferFields } from "./fields/PriceOfferFields";
import { BookingTypeField } from "./fields/BookingTypeField";
import { QuickCreateUserDialog } from "./dialogs/QuickCreateUserDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const bookingFormSchema = z.object({
  userId: z.number({ message: "User is required" }),
  statusId: z.number().optional(),
  venueId: z.number({ message: "Venue is required" }),
  duration: z.string(),
  totalPrice: z.number().min(0),
  type: z.enum(["standard", "academy", "clocked"]),
  hasOffer: z.boolean(),
  offerValue: z.number().min(0),
  isRecurring: z.boolean(),
  repeatFrequency: z.enum(["weekly", "daily"]),
  repeatCount: z.number().min(1).max(52),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface AdminCreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId: number;
  venueName: string;
  date: string;
  startTime: string;
  onSuccess?: () => void;
}

export function AdminCreateBookingDialog({
  open,
  onOpenChange,
  venueId,
  venueName,
  date,
  startTime,
  onSuccess,
}: AdminCreateBookingDialogProps) {
  const [userSearch, setUserSearch] = useState("");
  const { users, venues, statuses } = useBookingData(open, userSearch);
  const { createBooking, loading } = useBookingOperations();
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [searchForQuickCreate, setSearchForQuickCreate] = useState("");

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      userId: 0,
      duration: "1",
      totalPrice: 0,
      venueId: venueId,
      type: "standard" as const,
      hasOffer: false,
      offerValue: 0,
      isRecurring: false,
      repeatFrequency: "weekly" as const,
      repeatCount: 1,
      notes: "",
    },
  });

  // Reset form when opening to clear previous data
  useEffect(() => {
    if (open) {
      form.reset({
        userId: 0,
        statusId: undefined, // Will be set by the statuses effect below
        duration: "1",
        totalPrice: 0,
        venueId: venueId,
        type: "standard",
        hasOffer: false,
        offerValue: 0,
        isRecurring: false,
        repeatFrequency: "weekly",
        repeatCount: 1,
        notes: "",
      });
      setUserSearch("");
      setSearchForQuickCreate("");
    }
  }, [open, venueId, form]);

  // Set default status to "Pending" once statuses are loaded
  useEffect(() => {
    if (open && statuses.length > 0 && !form.getValues("statusId")) {
      const pendingStatus = statuses.find(s => s.name.toLowerCase() === "pending");
      if (pendingStatus) {
        form.setValue("statusId", pendingStatus.id);
      }
    }
  }, [open, statuses, form]);

  async function onSubmit(values: BookingFormValues) {
    const startStr = `${date}T${startTime}`;
    const startDate = parse(startStr, "yyyy-MM-dd'T'HH:mm", new Date());
    const endDate = addHours(startDate, Number(values.duration));
    const endTimeStr = format(endDate, "HH:mm");

    const payload = {
      userId: values.userId,
      venueId: values.venueId,
      date,
      startTime: startTime.substring(0, 5),
      endTime: endTimeStr,
      statusId: values.statusId,
      totalPrice: values.totalPrice,
      type: values.type,
      hasOffer: values.hasOffer,
      offerValue: values.offerValue,
      ...(values.isRecurring && values.repeatCount > 1
        ? {
          repeat: {
            frequency: values.repeatFrequency,
            count: values.repeatCount,
          },
        }
        : {}),
    };

    await createBooking(payload, () => {
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    });
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const isRecurring = form.watch("isRecurring");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Booking for {venueName}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {format(new Date(date), "PPP")} at {startTime}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <VenueSelectField form={form} venues={venues} />
            <UserSelectField
              form={form}
              users={users}
              setUserSearch={setUserSearch}
              onQuickCreate={(search) => {
                setSearchForQuickCreate(search);
                setIsQuickCreateOpen(true);
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Hour</SelectItem>
                        <SelectItem value="1.5">1.5 Hours</SelectItem>
                        <SelectItem value="2">2 Hours</SelectItem>
                        <SelectItem value="3">3 Hours</SelectItem>
                        <SelectItem value="4">4 Hours</SelectItem>
                        <SelectItem value="5">5 Hours</SelectItem>
                        <SelectItem value="6">6 Hours</SelectItem>
                        <SelectItem value="8">8 Hours</SelectItem>
                        <SelectItem value="12">12 Hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <BookingTypeField form={form} />
            </div>

            <StatusFields form={form} statuses={statuses} />
            <PriceOfferFields form={form} />

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any special notes or instructions..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurrence Fields */}
            <div className="space-y-4 border-t pt-4">
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Repeat Booking</FormLabel>
                      <div className="text-[0.7rem] text-muted-foreground">
                        Automatically create weekly reservations
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

              {isRecurring && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <FormField
                    control={form.control}
                    name="repeatFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="repeatCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weeks/Days</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={1} max={52} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  isRecurring && (
                    <RefreshCw className="mr-2 h-4 w-4 animate-in spin-in-180" />
                  )
                )}
                {isRecurring ? "Create Recurring Series" : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      <QuickCreateUserDialog
        open={isQuickCreateOpen}
        onOpenChange={setIsQuickCreateOpen}
        defaultPhone={searchForQuickCreate}
        onSuccess={(user) => {
          form.setValue("userId", user.id);
        }}
      />
    </Dialog>
  );
}
