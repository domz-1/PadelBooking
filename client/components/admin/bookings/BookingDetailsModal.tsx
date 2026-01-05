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
  const [showEdit, setShowEdit] = useState(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
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
                onClick={() => setShowEdit(true)}
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
      </DialogContent>

      {/* Booking Logs Modal */}
      {booking && (
        <BookingLogs
          bookingId={booking.id!}
          open={showLogs}
          onOpenChange={setShowLogs}
        />
      )}

      {/* Edit Booking Dialog */}
      {booking && (
        <EditBookingDialog
          booking={booking}
          open={showEdit}
          onOpenChange={(open) => {
            setShowEdit(open);
            if (!open) onSuccess?.();
          }}
          onSuccess={() => {
            setShowEdit(false);
            onSuccess?.();
          }}
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
