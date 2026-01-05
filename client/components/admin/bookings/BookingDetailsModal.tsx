"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  Pencil,
  Trash2,
  Shield,
  Clock as ClockIcon,
  PhoneCall,
  Smartphone,
  X,
  FileText,
  CalendarIcon as CalendarIconLucide,
  Loader2,
  Search,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { type Booking } from "@/lib/schemas";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EditBookingDialog } from "@/components/admin/bookings/EditBookingDialog";
import { BookingLogs } from "@/components/admin/bookings/BookingLogs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Separator } from "@/components/ui/separator";
import { useBookingOperations } from "@/hooks/useBookingOperations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useBookingData } from "@/hooks/useBookingData";
import { VenueSelectField } from "@/components/admin/bookings/fields/VenueSelectField";
import { UserSelectField } from "@/components/admin/bookings/fields/UserSelectField";
import { StatusFields } from "@/components/admin/bookings/fields/StatusFields";
import { PriceOfferFields } from "@/components/admin/bookings/fields/PriceOfferFields";
import { BookingTypeField } from "@/components/admin/bookings/fields/BookingTypeField";
import { adminUserService } from "@/lib/services/admin/users.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const bookingFormSchema = z.object({
  date: z.date(),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  totalPrice: z.number().min(0),
  userId: z.number(),
  venueId: z.number(),
  statusId: z.number().optional(),
  type: z.enum(["standard", "academy"]),
  hasOffer: z.boolean(),
  offerValue: z.number().min(0),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingDetailsModalProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BookingDetailsModal({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: BookingDetailsModalProps) {
  const [viewMode, setViewMode] = useState<'details' | 'edit'>('details'); // Track current view mode
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const {
    loading,
    deleteBooking,
    waitlist,
    fetchWaitlist,
    deleteWaitlistEntry,
  } = useBookingOperations();

  useEffect(() => {
    if (open) {
      fetchWaitlist({
        venueId: Number(booking.venueId),
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      });
    }
  }, [
    open,
    booking.id,
    booking.venueId,
    booking.date,
    booking.startTime,
    booking.endTime,
    fetchWaitlist,
  ]);

  const handleDelete = async () => {
    if (!booking.id) return;
    await deleteBooking(booking.id, "single", () => {
      onOpenChange(false);
      onSuccess?.();
    });
  };

  const formatPhoneForWhatsApp = (phone: string | undefined) => {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  };

  const handleCallUser = () => {
    if (booking.User?.phone) {
      window.location.href = `tel:${booking.User.phone}`;
    } else {
      toast.info("No phone number available for this user");
    }
  };

  const handleWhatsAppChat = () => {
    const phone = formatPhoneForWhatsApp(booking.User?.phone);
    if (phone) {
      window.open(`https://wa.me/${phone}`, "_blank");
    } else {
      toast.info("No phone number available for WhatsApp");
    }
  };

  const status = booking.BookingStatus;

  // Reset to details view when modal is closed
  useEffect(() => {
    if (!open) {
      setViewMode('details');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {viewMode === 'details' ? (
          <>
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      Booking #{booking.id}
                    </DialogTitle>
                    {status ? (
                      <div
                        className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border"
                        style={{
                          backgroundColor: `${status.color}15`,
                          color: status.color,
                          borderColor: `${status.color}30`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ backgroundColor: status.color }}
                        />
                        {status.name}
                      </div>
                    ) : (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border bg-gray-50 text-gray-600 border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        {booking.status || "No Status"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mr-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewMode('edit'); // Switch to edit mode
                    }}
                    className="h-8 gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-8 gap-1.5 bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
              <Separator className="mt-4" />
            </DialogHeader>

            <div className="p-6 space-y-6">
              {/* Main Grid: Booking & Venue Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Schedule
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="h-8 w-8 rounded-lg flex items-center justify-center p-0 border-primary/20 bg-primary/5"
                      >
                        <Calendar className="w-4 h-4 text-primary" />
                      </Badge>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm font-semibold">{booking.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="h-8 w-8 rounded-lg flex items-center justify-center p-0 border-primary/20 bg-primary/5"
                      >
                        <Clock className="w-4 h-4 text-primary" />
                      </Badge>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Time & Duration
                        </p>
                        <p className="text-sm font-semibold">
                          {booking.startTime} - {booking.endTime}
                          <span className="text-muted-foreground font-normal ml-1">
                            (
                            {(() => {
                              const [startH, startM] = booking.startTime
                                .split(":")
                                .map(Number);
                              const [endH, endM] = booking.endTime
                                .split(":")
                                .map(Number);
                              const duration = endH - startH + (endM - startM) / 60;
                              return `${duration}h`;
                            })()}
                            )
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    Venue & Price
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="h-8 w-8 rounded-lg flex items-center justify-center p-0 border-primary/20 bg-primary/5"
                      >
                        <MapPin className="w-4 h-4 text-primary" />
                      </Badge>
                      <div>
                        <p className="text-xs text-muted-foreground">Venue</p>
                        <p className="text-sm font-semibold truncate max-w-[150px]">
                          {booking.Venue?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="h-8 w-8 rounded-lg flex items-center justify-center p-0 border-primary/20 bg-primary/5"
                      >
                        <DollarSign className="w-4 h-4 text-primary" />
                      </Badge>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Price</p>
                        <p className="text-sm font-bold text-green-600">
                          {booking.totalPrice} USD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Customer
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] gap-1 px-2 border-green-500/30 font-bold text-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={handleCallUser}
                      disabled={!booking.User?.phone}
                    >
                      <PhoneCall className="w-3 h-3" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] gap-1 px-2 border-green-500/30 font-bold text-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={handleWhatsAppChat}
                      disabled={!booking.User?.phone}
                    >
                      <Smartphone className="w-3 h-3" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">
                      {booking.User?.name || "Unknown Customer"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.User?.email}
                    </p>
                    {booking.User?.phone && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 font-medium">
                        <Phone className="w-3 h-3" />
                        {booking.User.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Waitlist Section */}
              {waitlist.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ClockIcon className="w-3 h-3" />
                    Waitlist Queue ({waitlist.length})
                  </h4>
                  <div className="bg-muted/20 border rounded-xl overflow-hidden divide-y">
                    {waitlist.map((entry, idx) => (
                      <div
                        key={entry.id || `wait-${idx}`}
                        className="flex items-center justify-between p-2.5 px-4 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-muted-foreground h-5 w-5 rounded-md bg-muted flex items-center justify-center border">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">
                              {entry.User?.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {entry.User?.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() =>
                            deleteWaitlistEntry(entry.id, () => {
                              fetchWaitlist({
                                venueId: Number(booking.venueId),
                                date: booking.date,
                                startTime: booking.startTime,
                                endTime: booking.endTime,
                              });
                            })
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {booking.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    Admin Notes
                  </h4>
                  <div className="bg-yellow-50/50 border border-yellow-200/50 p-3 rounded-xl text-sm italic py-2.5">
                    {booking.notes}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="p-4 bg-muted/30 border-t flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {booking.type || "Standard"}
                </div>
                {booking.hasOffer && (
                  <div className="flex items-center gap-1 text-green-600">
                    <DollarSign className="w-3 h-3" />
                    Multi-Slot Offer Applied
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex items-center gap-1"
                  onClick={() => setShowLogs(true)}
                >
                  <FileText className="w-3 h-3" />
                  View Logs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-8"
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          // Edit View - Render the edit dialog content directly within the same dialog
          <div className="p-6">
            <EditBookingDialogContent
              booking={booking}
              onOpenChange={() => {
                setViewMode('details'); // Go back to details view
                onSuccess?.();
              }}
              onSuccess={() => {
                setViewMode('details'); // Go back to details view after successful edit
                onSuccess?.();
              }}
            />
          </div>
        )}
      </DialogContent>

      {/* Booking Logs Modal */}
      {booking && (
        <BookingLogs
          bookingId={booking.id!}
          open={showLogs}
          onOpenChange={setShowLogs}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Booking"
        description="Are you sure you want to permanently delete this booking? This action cannot be undone."
        onConfirm={handleDelete}
        variant="destructive"
      />
    </Dialog>
  );
}

// EditBookingDialogContent - Just the content without the Dialog wrapper
interface EditBookingDialogContentProps {
  booking: Booking;
  onOpenChange: () => void;
  onSuccess?: () => void;
}

function EditBookingDialogContent({
  booking,
  onOpenChange,
  onSuccess
}: EditBookingDialogContentProps) {
  const [userSearch, setUserSearch] = useState("");
  const { users, venues, statuses, loading: dataLoading } = useBookingData(true, userSearch); // Always load data when in edit mode
  const {
    loading,
    updateBooking,
    deleteBooking,
    waitlist,
    fetchWaitlist,
    joinWaitlist,
    deleteWaitlistEntry,
  } = useBookingOperations();

  const [waitlistSearch, setWaitlistSearch] = useState("");
  const [waitlistUsers, setWaitlistUsers] = useState<
    Array<{ id: number; name: string; email?: string; phone?: string }>
  >([]);
  const [selectedWaitlistUser, setSelectedWaitlistUser] = useState<
    string | null
  >(null);
  const [seriesOption, setSeriesOption] = useState<"single" | "upcoming">(
    "single",
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: new Date(booking.date + "T12:00:00"),
      startTime: booking.startTime.substring(0, 5),
      endTime: booking.endTime.substring(0, 5),
      totalPrice: Number(booking.totalPrice),
      userId: Number(booking.userId),
      venueId: Number(booking.venueId),
      statusId: booking.statusId ? Number(booking.statusId) : undefined,
      type: (booking.type as "standard" | "academy") || "standard",
      hasOffer: !!booking.hasOffer,
      offerValue: Number(booking.offerValue || 0),
      notes: booking.notes || "",
    },
  });

  useEffect(() => {
    if (
      booking.venueId &&
      booking.date &&
      booking.startTime &&
      booking.endTime
    ) {
      fetchWaitlist({
        venueId: Number(booking.venueId),
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      });
    }
  }, [
    booking.id,
    booking.venueId,
    booking.date,
    booking.startTime,
    booking.endTime,
    fetchWaitlist,
  ]);

  useEffect(() => {
    const fetchWaitlistSearch = async () => {
      if (waitlistSearch.length > 1) {
        try {
          const res = await adminUserService.getAll({
            limit: 10,
            search: waitlistSearch,
          });
          setWaitlistUsers(
            res.data as Array<{ id: number; name: string; email: string }>,
          );
        } catch (error) {
          console.error("Failed to search waitlist users", error);
        }
      }
    };
    fetchWaitlistSearch();
  }, [waitlistSearch]);

  async function onSubmit(values: BookingFormValues) {
    if (!booking.id) return;
    const formattedData = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
      statusId: values.statusId || undefined,
      seriesOption: booking.recurrenceId ? seriesOption : "single",
    };
    await updateBooking(booking.id as number, formattedData, () => {
      onOpenChange();
      onSuccess?.();
    });
  }

  const handleDelete = async () => {
    if (!booking.id) return;
    await deleteBooking(
      booking.id as number,
      booking.recurrenceId ? seriesOption : "single",
      () => {
        onOpenChange();
        onSuccess?.();
      },
    );
  };

  const onAddWaitlist = async () => {
    if (!selectedWaitlistUser) return;
    await joinWaitlist(
      {
        userId: Number(selectedWaitlistUser),
        venueId: Number(booking.venueId),
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      },
      () => {
        setSelectedWaitlistUser(null);
        setWaitlistSearch("");
        fetchWaitlist({
          venueId: Number(booking.venueId),
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
        });
      },
    );
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const currentStatusId = form.watch("statusId");
  const currentStatus =
    statuses.find((s) => s.id === currentStatusId) || booking.BookingStatus;

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <DialogTitle>Management: Booking #{booking.id}</DialogTitle>
            {currentStatus && (
              <div
                className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border"
                style={{
                  backgroundColor: `${currentStatus.color}15`,
                  color: currentStatus.color,
                  borderColor: `${currentStatus.color}30`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: currentStatus.color }}
                />
                {currentStatus.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {dataLoading ? (
        <div className="space-y-6 py-4">
          {/* Loading skeleton for form fields */}
          <div className="space-y-4">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-1/3 self-end ml-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      ) : (
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="waitlist">
              Waitlist ({waitlist.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value instanceof Date ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIconLucide className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarUI
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <UserSelectField
                  form={form}
                  users={users}
                  setUserSearch={setUserSearch}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <VenueSelectField form={form} venues={venues} />
                  <BookingTypeField form={form} />
                </div>

                <StatusFields form={form} statuses={statuses} />
                <PriceOfferFields form={form} />

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

                {booking.recurrenceId && (
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-primary">
                      <RefreshCw className="w-4 h-4" />
                      Update Options
                    </div>
                    <RadioGroup
                      value={seriesOption}
                      onValueChange={(v: "single" | "upcoming") =>
                        setSeriesOption(v)
                      }
                      className="grid grid-cols-1 gap-2"
                    >
                      <div className="flex items-center space-x-2 bg-background p-2 rounded border cursor-pointer hover:bg-accent/50">
                        <RadioGroupItem value="single" id="single" />
                        <Label
                          htmlFor="single"
                          className="flex-1 cursor-pointer"
                        >
                          This booking only
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-background p-2 rounded border cursor-pointer hover:bg-accent/50">
                        <RadioGroupItem value="upcoming" id="upcoming" />
                        <Label
                          htmlFor="upcoming"
                          className="flex-1 cursor-pointer"
                        >
                          This and all upcoming bookings
                        </Label>
                      </div>
                    </RadioGroup>
                    <p className="text-[10px] text-muted-foreground mt-2 px-1">
                      Note: &ldquo;Upcoming&rdquo; will apply changes to all
                      future instances in this series.
                    </p>
                  </div>
                )}

                <DialogFooter className="flex flex-row justify-between pt-4 border-t gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setViewMode('details'); // Go back to details view
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} size="sm">
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {booking.recurrenceId && seriesOption === "upcoming"
                        ? "Save Series"
                        : "Save Changes"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="waitlist" className="py-4 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-none">
                  Add User to Waitlist
                </label>
                <div className="flex gap-2">
                  <Select
                    onValueChange={setSelectedWaitlistUser}
                    value={selectedWaitlistUser || undefined}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Search user to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="flex items-center px-3 pb-2 pt-1 border-b">
                        <Search className="mr-2 h-4 w-4 opacity-50" />
                        <Input
                          placeholder="Type name or email..."
                          value={waitlistSearch}
                          onChange={(e) => setWaitlistSearch(e.target.value)}
                          className="h-8 border-none focus-visible:ring-0 p-0"
                        />
                      </div>
                      {waitlistUsers.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          <div className="flex flex-col">
                            <span>{u.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {u.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    onClick={onAddWaitlist}
                    disabled={loading || !selectedWaitlistUser}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border bg-card">
                <div className="p-3 border-b bg-muted/30">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-3 h-3 text-primary" />
                    Waitlist Queue
                  </h4>
                </div>
                {waitlist.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground italic">
                    No users in waitlist
                  </div>
                ) : (
                  <div className="bg-muted/20 border rounded-xl overflow-hidden divide-y">
                    {waitlist.map((entry, idx) => (
                      <div
                        key={entry.id || `wait-${idx}`}
                        className="flex items-center justify-between p-2.5 px-4 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {entry.User?.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {entry.User?.email}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() =>
                            deleteWaitlistEntry(entry.id, () => {
                              fetchWaitlist({
                                venueId: Number(booking.venueId),
                                date: booking.date,
                                startTime: booking.startTime,
                                endTime: booking.endTime,
                              });
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
