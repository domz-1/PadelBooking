"use client";

import { useMemo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import type { Venue, Booking, Branch, WaitlistEntry } from "@/lib/schemas";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  User,
  Plus,
  Shield,
  Users,
  Repeat,
  CalendarPlus,
  ListOrdered,
  ClipboardList,
} from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Utils
import {
  formatHour,
  formatTimeForValue,
  getBookingByVenueAndHour,
  isStartOfBooking,
  getWaitlistEntry,
  isOwnBooking,
  isUserInOpenMatch,
  getOpenMatchPlayerCount,
  getBookingStatusStyle,
} from "@/lib/booking-utils";

// Dialogs
import { EditBookingDialog } from "@/components/admin/bookings/EditBookingDialog";
import { AdminCreateBookingDialog } from "@/components/admin/bookings/AdminCreateBookingDialog";
import { BookingDetailsModal } from "@/components/admin/bookings/BookingDetailsModal";
import { BookingSkeleton } from "@/components/ui/booking-skeleton";
import { VenueInfoDialog } from "./dialogs/VenueInfoDialog";
import { WaitlistDialog } from "./dialogs/WaitlistDialog";
import { ManageBookingDialog } from "./dialogs/ManageBookingDialog";
import { DeleteBookingDialog } from "./dialogs/DeleteBookingDialog";
import { OpenMatchDialog } from "./dialogs/OpenMatchDialog";
import { ConvertToOpenMatchDialog } from "./dialogs/ConvertToOpenMatchDialog";
import { EmptySlotsBoard } from "@/components/admin/bookings/EmptySlotsBoard";
import { WaitlistBoard } from "@/components/admin/bookings/WaitlistBoard";

// Store
import { useBookingStore } from "@/hooks/use-booking-store";
import { Button } from "@/components/ui/button";

interface BookingGridProps {
  bookings: Booking[];
  venues: Venue[];
  branches?: Branch[];
  date: string; // YYYY-MM-DD
  onCreateBooking: (venueId: number, time: string) => void;
  onViewBooking?: (booking: Booking) => void;
  onJoinWaitlist?: (venueId: number, time: string) => void;
  onEditBooking?: (booking: Booking) => void;
  onDeleteBooking?: (booking: Booking) => void;
  onConvertToOpenMatch?: (bookingId: number, maxPlayers?: number) => void;
  onJoinOpenMatch?: (bookingId: number) => void;
  onLeaveOpenMatch?: (bookingId: number) => void;
  publicView?: boolean;
  waitlistEntries?: WaitlistEntry[];
  onWaitlistUpdate?: () => void;
  loading?: boolean;
  selectedBranchId?: string | number;
  onDateChange?: (date: Date | undefined) => void;
}

const BRANCH_COLORS = [
  "bg-zinc-50",
  "bg-gray-100 dark:bg-gray-800",
  "bg-slate-100/80 dark:bg-slate-800/80",
  "bg-neutral-100 dark:bg-neutral-800/80",
  "bg-gray-50 dark:bg-gray-800/80",
  "bg-stone-100 dark:bg-stone-800/80",
];

export default function BookingGrid({
  bookings,
  venues,
  branches = [],
  onCreateBooking,
  onConvertToOpenMatch,
  onJoinOpenMatch,
  onLeaveOpenMatch,
  date,
  publicView = false,
  waitlistEntries = [],
  onWaitlistUpdate,
  loading = false,
  selectedBranchId,
  onDateChange,
}: BookingGridProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Store Hooks
  const localSelectedBranchId = useBookingStore((state) => state.selectedBranchId);
  const modals = useBookingStore((state) => state.modals);
  const adminCreateSlot = useBookingStore((state) => state.adminCreateSlot);
  const selectedBooking = useBookingStore((state) => state.selectedBooking);
  const setSelectedVenue = useBookingStore((state) => state.setSelectedVenue);
  const setStoreSelectedBranchId = useBookingStore((state) => state.setSelectedBranchId);
  const setModalOpen = useBookingStore((state) => state.setModalOpen);
  const setSelectedBooking = useBookingStore((state) => state.setSelectedBooking);
  const setSlotInfo = useBookingStore((state) => state.setSlotInfo);
  const setAdminCreateSlot = useBookingStore((state) => state.setAdminCreateSlot);
  const reset = useBookingStore((state) => state.reset);

  // Reset store on unmount or when crucial props change significantly? 
  // Maybe just reset on unmount to clear modals.
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Determine if user can book based on authentication status
  const canBook = isAuthenticated && !publicView;

  // Sync the selectedBranchId prop with local state
  useEffect(() => {
    if (selectedBranchId !== undefined) {
      setStoreSelectedBranchId(
        selectedBranchId === "all" ? "all" : Number(selectedBranchId),
      );
    }
  }, [selectedBranchId, setStoreSelectedBranchId]);

  // Filter venues by branch if branches exist
  const filteredVenues = useMemo(() => {
    let result = venues;
    if (localSelectedBranchId !== "all") {
      result = venues.filter((v) => v.branchId === localSelectedBranchId);
    }
    return [...result].sort((a, b) => {
      // First sort by branchId (with fallback to 0 for safety)
      const aBranch = a.branchId ?? 0;
      const bBranch = b.branchId ?? 0;
      if (aBranch !== bBranch) {
        return aBranch - bBranch;
      }
      // Then sort by name
      return a.name.trim().localeCompare(b.name.trim(), undefined, { sensitivity: 'base' });
    });
  }, [venues, localSelectedBranchId]);

  const hours = Array.from({ length: 24 }, (_, i) => i); // 12 AM to 11 PM

  const [showEmptySlots, setShowEmptySlots] = useState(false);
  const [showWaitlistBoard, setShowWaitlistBoard] = useState(false);

  const isAdmin = user?.role === "admin";

  return (
    <div className="w-full space-y-4">
      {loading ? (
        <BookingSkeleton />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Branch Selector */}
            {branches.length > 0 ? (
              <div className="flex justify-center flex-1">
                <Tabs
                  value={String(localSelectedBranchId)}
                  onValueChange={(v) =>
                    setStoreSelectedBranchId(v === "all" ? "all" : Number(v))
                  }
                >
                  <TabsList>
                    <TabsTrigger value="all">All Branches</TabsTrigger>
                    {branches.map((b) => (
                      <TabsTrigger key={b.id} value={String(b.id)}>
                        {b.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Date Picker & Tools */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300 rounded-full px-4"
                    onClick={() => setShowWaitlistBoard(true)}
                  >
                    <ListOrdered className="w-4 h-4" />
                    <span className="hidden sm:inline">Waitlist Board</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300 rounded-full px-4"
                    onClick={() => setShowEmptySlots(true)}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span className="hidden sm:inline">Empty Slots Board</span>
                  </Button>
                </div>
              )}
              {onDateChange && (
                <DatePicker
                  date={date ? new Date(date) : undefined}
                  setDate={onDateChange}
                  className="w-[200px]"
                />
              )}
            </div>
          </div>

          {/* Create Open Match Button - Hidden mostly per original */}
          <div className="flex justify-end mb-4 hidden ">
            <Button
              onClick={() => setModalOpen("openMatch", true)}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Create Open Match
            </Button>
          </div>

          <div className="w-full bg-card rounded-lg shadow-sm border p-4">
            <ScrollArea className="w-full">
              <div className="min-w-[1000px] w-full">
                {/* Header Row: Venues */}
                <div
                  className="grid gap-2 mb-2 sticky top-0 z-30 bg-background/95 backdrop-blur py-2"
                  style={{
                    gridTemplateColumns: `80px repeat(${filteredVenues.length}, 1fr)`,
                  }}
                >
                  <div className="h-10 flex items-center justify-center font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 rounded text-xs gap-1">
                    <Clock className="w-3 h-3" />
                    Time
                  </div>
                  {filteredVenues.map((venue) => {
                    const branchColorClass = venue.branchId
                      ? BRANCH_COLORS[venue.branchId % BRANCH_COLORS.length]
                      : "bg-muted/50";

                    return (
                      <div
                        key={venue.id}
                        onClick={() => setSelectedVenue(venue)}
                        className={cn(
                          "h-14 flex flex-col items-center justify-center font-semibold text-sm rounded cursor-pointer gap-0.5 px-2 border border-transparent hover:border-border transition-all text-center",
                          branchColorClass,
                          "hover:bg-muted"
                        )}
                      >
                        {venue.Branch && (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide whitespace-normal text-wrap break-words max-w-full">
                            {venue.Branch.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-brand-500" />
                          <span className="whitespace-normal text-wrap break-words text-center max-w-full">{venue.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grid Rows */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="grid gap-2 mb-2"
                    style={{
                      gridTemplateColumns: `80px repeat(${filteredVenues.length}, 1fr)`,
                    }}
                  >
                    {/* Time Cell */}
                    <div className="h-24 flex items-center justify-center text-xs font-semibold text-muted-foreground bg-secondary/30 rounded border border-transparent">
                      {formatHour(hour)}
                    </div>

                    {/* Venue Cells */}
                    {filteredVenues.map((venue) => {
                      const booking = getBookingByVenueAndHour(
                        bookings,
                        venue.id,
                        hour
                      );
                      const isBooked = !!booking;
                      const isStart = isStartOfBooking(booking, hour);
                      const isOwn =
                        booking && user ? isOwnBooking(booking, user) : false;
                      const waitlisted = getWaitlistEntry(
                        waitlistEntries,
                        venue.id,
                        hour,
                        date
                      );

                      return (
                        <div
                          key={`${venue.id}-${hour}`}
                          className={cn(
                            "h-24 relative rounded-lg border transition-all duration-200",
                            !isBooked &&
                            "bg-background hover:bg-accent/40 cursor-pointer border-dashed border-border/60 hover:border-primary/50 group flex flex-col items-center justify-center",
                            isBooked && "border-none bg-transparent",
                            waitlisted &&
                            "border-orange-400 border-2 bg-orange-50/10"
                          )}
                          onClick={() => {
                            if (!isBooked) {
                              if (isAdmin) {
                                setAdminCreateSlot({
                                  venueId: venue.id,
                                  venueName: venue.name,
                                  time: formatTimeForValue(hour),
                                });
                                setModalOpen("adminCreate", true);
                              } else if (canBook) {
                                onCreateBooking(
                                  venue.id,
                                  formatTimeForValue(hour)
                                );
                              } else if (!isAuthenticated) {
                                router.push("/auth/login");
                              }
                            }
                          }}
                        >
                          {/* Booking Slot */}
                          {isBooked && isStart && (
                            <div
                              className={cn(
                                "absolute inset-0 z-20 rounded-md p-2 text-xs flex flex-col gap-1 shadow-sm border animate-in fade-in zoom-in-95 overflow-hidden transition-transform active:scale-[0.98]",
                                getBookingStatusStyle(booking, isOwn, isAdmin)
                                  .className,
                                "cursor-pointer ring-offset-1",
                                isOwn && "ring-2 ring-primary"
                              )}
                              style={{
                                ...getBookingStatusStyle(
                                  booking,
                                  isOwn,
                                  isAdmin
                                ).style,
                                height: `calc(100% * ${parseInt(booking.endTime.split(":")[0]) -
                                  parseInt(booking.startTime.split(":")[0])
                                  } + ${(parseInt(booking.endTime.split(":")[0]) -
                                    parseInt(booking.startTime.split(":")[0]) -
                                    1) *
                                  0.5
                                  }rem)`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isAuthenticated) {
                                  router.push("/auth/login");
                                  return;
                                }
                                if (isOwn || isAdmin) {
                                  setSelectedBooking(booking);
                                  if (isAdmin) {
                                    setModalOpen("management", true);
                                  } else {
                                    setModalOpen("management", true);
                                  }
                                } else if (booking.isOpenMatch) {
                                  if (isUserInOpenMatch(booking, user)) {
                                    onLeaveOpenMatch?.(booking.id as number);
                                  } else {
                                    onJoinOpenMatch?.(booking.id as number);
                                  }
                                } else {
                                  setSlotInfo({
                                    venueId: venue.id,
                                    time: formatTimeForValue(hour),
                                  });
                                  setModalOpen("waitlist", true);
                                }
                              }}
                            >
                              {waitlisted && (
                                <div className="absolute top-1 right-1 z-30">
                                  <Badge className="bg-orange-500 hover:bg-orange-600 text-[9px] px-1.5 h-4.5 border-white shadow-sm animate-pulse">
                                    My Waitlist
                                  </Badge>
                                </div>
                              )}
                              <div className="font-bold whitespace-normal text-wrap wrap-break-word flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1">
                                  {isOwn ? (
                                    <User className="w-3.5 h-3.5" />
                                  ) : (
                                    <Shield className="w-3.5 h-3.5" />
                                  )}
                                  {(isOwn || isAdmin) && (
                                    <span className="whitespace-normal text-wrap wrap-break-word text-center max-w-full">
                                      {booking.User?.name || "Booked"}
                                    </span>
                                  )}
                                  {!isOwn && !isAdmin && <span>Reserved</span>}
                                </div>
                              </div>

                              {(isOwn || isAdmin) && (
                                <div className="flex justify-between items-center opacity-90 mt-auto">
                                  <span className="whitespace-normal text-wrap wrap-break-word text-[9px] uppercase tracking-wider font-bold">
                                    {booking.BookingStatus?.name ||
                                      booking.status ||
                                      (booking.type === "academy"
                                        ? "Academy"
                                        : "Standard")}
                                  </span>
                                  {booking.recurrenceId && (
                                    <span className="whitespace-normal text-wrap wrap-break-word text-[9px] uppercase tracking-wider font-bold">
                                      <Repeat />
                                    </span>
                                  )}
                                </div>
                              )}
                              {booking.isOpenMatch && (
                                <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center text-[9px]">
                                  <Badge className="bg-green-600 hover:bg-green-700 text-white h-4 px-1.5 flex items-center gap-1">
                                    <Users className="w-2.5 h-2.5" />
                                    Open Match
                                  </Badge>
                                  <span className="text-green-700 font-bold">
                                    {getOpenMatchPlayerCount(booking)}/
                                    {booking.openMatchMaxPlayers || 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {!isBooked && (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {waitlisted && (
                                <div className="absolute top-1 right-1 z-30 pointer-events-none">
                                  <Badge className="bg-orange-500 text-[9px] px-1.5 h-4.5 border-white shadow-sm">
                                    My Waitlist
                                  </Badge>
                                </div>
                              )}
                              {canBook ? (
                                <>
                                  <span className="text-xs text-primary font-bold flex items-center gap-1 mb-1">
                                    <Plus className="w-3 h-3" /> Book
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    ${venue.pricePerHour}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                  <Plus className="w-3 h-3" /> Available
                                </span>
                              )}

                              {/* Removed Join Waitlist from free slots as per requirement */}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* -- Dialogs -- */}
            <VenueInfoDialog />
            <WaitlistDialog
              date={date}
              waitlistEntries={waitlistEntries}
              onWaitlistUpdate={onWaitlistUpdate}
            />

            {/* Details Modal */}
            {selectedBooking && (
              <BookingDetailsModal
                booking={selectedBooking}
                open={modals.details}
                onOpenChange={(open) => {
                  setModalOpen("details", open);
                  if (!open) onWaitlistUpdate?.();
                }}
                onSuccess={() => {
                  setModalOpen("details", false);
                  onWaitlistUpdate?.();
                }}
              />
            )}

            {/* Admin Edit Modal */}
            {isAdmin && selectedBooking && (
              <EditBookingDialog
                booking={selectedBooking}
                open={modals.management}
                onOpenChange={(open) => setModalOpen("management", open)}
                onSuccess={() => window.location.reload()}
              />
            )}

            {/* User Management Modal */}
            {!isAdmin && (
              <ManageBookingDialog date={date} />
            )}

            <DeleteBookingDialog />

            <OpenMatchDialog date={date} bookings={bookings} />

            <ConvertToOpenMatchDialog onConvertToOpenMatch={onConvertToOpenMatch} />

            {adminCreateSlot && (
              <AdminCreateBookingDialog
                open={modals.adminCreate}
                onOpenChange={(open) => setModalOpen("adminCreate", open)}
                venueId={adminCreateSlot.venueId}
                venueName={adminCreateSlot.venueName}
                date={date}
                startTime={adminCreateSlot.time}
                onSuccess={() => {
                  // The parent page (BookingsPage) has a socket listener that will refresh the data
                }}
              />
            )}

            <EmptySlotsBoard
              open={showEmptySlots}
              onOpenChange={setShowEmptySlots}
              venues={venues}
              branches={branches}
              initialDate={date}
            />

            <WaitlistBoard
              open={showWaitlistBoard}
              onOpenChange={setShowWaitlistBoard}
              initialDate={date}
            />

          </div >
        </>
      )}
    </div >
  );
}
