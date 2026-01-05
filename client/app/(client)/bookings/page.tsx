"use client";

import { useEffect, useState, useCallback } from "react";
import BookingGrid from "@/components/bookings/BookingGrid";
import api from "@/lib/api";
import { format } from "date-fns";
import type { Venue, Booking, Branch } from "@/lib/schemas";
import type { WaitlistEntry } from "@/lib/schemas";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/use-auth-store";
import { socketService } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { BookingSkeleton } from "@/components/ui/booking-skeleton";
import { ClientPage } from "@/components/wrapper/ClientPage";

export default function BookingsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    venueId: number;
    time: string;
  } | null>(null);
  const [bookingDuration, setBookingDuration] = useState(1); // Hours

  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const formattedDate = format(date, "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Parallel fetch
      const [venuesRes, bookingsRes, branchesRes, waitlistRes] =
        await Promise.all([
          api.get("/venues"),
          api.get(`/bookings?date=${formattedDate}&limit=100`),
          api.get("/branches"),
          isAuthenticated
            ? api.get("/bookings/waitlist")
            : Promise.resolve({ data: { success: true, data: [] } }),
        ]);

      if (venuesRes.data.success) {
        setVenues(venuesRes.data.data);
      }

      if (waitlistRes.data.success) {
        setWaitlistEntries(waitlistRes.data.data);
      }

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }

      if (branchesRes.data) {
        if (Array.isArray(branchesRes.data)) {
          setBranches(branchesRes.data);
        } else if (branchesRes.data.success) {
          setBranches(branchesRes.data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Could not load schedule");
    } finally {
      setLoading(false);
    }
  }, [formattedDate, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData, isAuthenticated]);

  // Real-time updates listener
  useEffect(() => {
    socketService.connect(Number(user?.id));
    const socket = socketService.getSocket();

    if (socket) {
      socket.on(
        "bookingUpdate",
        ({
          type,
          data,
          id,
        }: {
          type: string;
          data: Booking;
          id: string | number;
        }) => {
          // Determine if the update affects currently viewed date
          const affectedDate = data?.date || null;
          if (affectedDate && affectedDate !== formattedDate) return;

          if (type === "create") {
            setBookings((prev) => [...prev, data]);
          } else if (type === "update") {
            setBookings((prev) =>
              prev.map((b) => (b.id === data.id ? data : b)),
            );
          } else if (type === "delete") {
            setBookings((prev) => prev.filter((b) => b.id !== Number(id)));
          }
        },
      );
    }

    return () => {
      if (socket) socket.off("bookingUpdate");
    };
  }, [formattedDate, user?.id]);

  const handleCreateBooking = (venueId: number, time: string) => {
    if (!isAuthenticated) {
      toast.info("Please login to book a court");
      router.push("/auth/login");
      return;
    }
    setSelectedSlot({ venueId, time });
    setShowBookingModal(true);
  };

  const handleConvertToOpenMatch = async (
    bookingId: number,
    maxPlayers: number = 4,
  ) => {
    try {
      const res = await api.post(
        `/bookings/${bookingId}/convert-to-open-match`,
        { maxPlayers },
      );
      if (res.data.success) {
        toast.success("Booking converted to Open Match!");
        fetchData(); // Refresh grid
      }
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to convert to Open Match",
      );
    }
  };

  const handleJoinOpenMatch = async (bookingId: number) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/join`);
      if (res.data.success) {
        toast.success("Successfully joined Open Match!");
        fetchData(); // Refresh grid
      }
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to join Open Match",
      );
    }
  };

  const handleLeaveOpenMatch = async (bookingId: number) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/leave`);
      if (res.data.success) {
        toast.success("Successfully left Open Match!");
        fetchData(); // Refresh grid
      }
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to leave Open Match",
      );
    }
  };

  const confirmBooking = async () => {
    if (!selectedSlot) return;

    try {
      const [hour] = selectedSlot.time.split(":").map(Number);
      const endHour = hour + bookingDuration;
      const endTime = `${endHour.toString().padStart(2, "0")}:00`;

      const payload = {
        venueId: selectedSlot.venueId,
        date: formattedDate,
        startTime: selectedSlot.time,
        endTime: endTime,
      };

      const res = await api.post("/bookings", payload);
      if (res.data.success) {
        toast.success("Booking created successfully!");
        setShowBookingModal(false);
        fetchData(); // Refresh grid
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    }
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Sponsor Carousel */}
      <div className="mb-8">
        <ClientPage.SponsorCarousel />
      </div>

      {/* Date Picker and Branch Selector in one row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d: Date | undefined) => {
                  if (d) {
                    // Adjust for timezone offset to ensure "YYYY-MM-DD" matches selected day
                    // Or simply set to noon to avoid midnight shifts
                    const newDate = new Date(d);
                    newDate.setHours(12, 0, 0, 0);
                    setDate(newDate);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Branch Selector */}
          <div className="w-full sm:w-auto">
            <select
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedBranchId}
              onChange={(e) =>
                setSelectedBranchId(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <BookingSkeleton />
      ) : (
        <BookingGrid
          venues={venues}
          bookings={bookings}
          branches={branches}
          date={formattedDate}
          waitlistEntries={waitlistEntries}
          onCreateBooking={handleCreateBooking}
          onWaitlistUpdate={fetchData}
          onViewBooking={(booking) => console.log(booking)}
          onConvertToOpenMatch={handleConvertToOpenMatch}
          onJoinOpenMatch={handleJoinOpenMatch}
          onLeaveOpenMatch={handleLeaveOpenMatch}
          publicView={!isAuthenticated}
          selectedBranchId={selectedBranchId}
        />
      )}

      {/* Create Booking Confirmation Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <div className="text-sm font-medium mt-1">{formattedDate}</div>
              </div>
              <div>
                <Label>Start Time</Label>
                <div className="text-sm font-medium mt-1">
                  {selectedSlot?.time}
                </div>
              </div>
            </div>
            <div>
              <Label>Duration</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 1.5, 2].map((dur) => (
                  <Button
                    key={dur}
                    variant={bookingDuration === dur ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBookingDuration(dur)}
                  >
                    {dur} Hour{dur > 1 ? "s" : ""}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmBooking}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
