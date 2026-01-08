"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import BookingGrid from "@/components/bookings/BookingGrid";
import api from "@/lib/api";
import { format } from "date-fns";
import type { Venue, Booking, Branch, WaitlistEntry } from "@/lib/schemas";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/use-auth-store";
import { socketService } from "@/lib/socket";
import { useRouter, useSearchParams } from "next/navigation";
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
import { SponsorCarousel } from "@/components/wrapper/ClientPage";

function BookingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize from URL or defaults
  const [date, setDate] = useState<Date>(() => {
    const dParam = searchParams.get("date");
    if (dParam) {
      const d = new Date(dParam);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  });

  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    return searchParams.get("branch") || "all";
  });

  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    venueId: number;
    time: string;
  } | null>(null);
  const [bookingDuration, setBookingDuration] = useState(1); // Hours

  const { isAuthenticated, user } = useAuthStore();
  const formattedDate = format(date, "yyyy-MM-dd");

  // Bidirectional sync: URL -> local state
  useEffect(() => {
    const dParam = searchParams.get("date");
    if (dParam) {
      const d = new Date(dParam);
      if (!isNaN(d.getTime())) {
        if (format(d, "yyyy-MM-dd") !== formattedDate) {
          setDate(d);
        }
      }
    }

    const bParam = searchParams.get("branch");
    if (bParam && bParam !== selectedBranchId) {
      setSelectedBranchId(bParam);
    }
  }, [searchParams, formattedDate, selectedBranchId]);

  // Ensure defaults in URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    if (!params.get("date")) {
      params.set("date", formattedDate);
      changed = true;
    }
    if (!params.get("branch")) {
      params.set("branch", "all");
      changed = true;
    }

    if (changed) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, formattedDate, router]);

  const updateUrl = useCallback((newDate?: string, newBranch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (newDate && params.get("date") !== newDate) {
      params.set("date", newDate);
      changed = true;
    }
    if (newBranch && params.get("branch") !== newBranch) {
      params.set("branch", newBranch);
      changed = true;
    }

    if (changed) {
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [venuesRes, branchesRes] = await Promise.all([
        api.get("/venues"),
        api.get("/branches"),
      ]);

      let bookingsData = [];
      let waitlistData = [];

      if (isAuthenticated) {
        const [bookingsRes, waitlistRes] = await Promise.all([
          api.get(`/bookings?date=${formattedDate}&limit=100`),
          api.get("/bookings/waitlist"),
        ]);

        if (bookingsRes.data.success) {
          bookingsData = bookingsRes.data.data;
        }
        if (waitlistRes.data.success) {
          waitlistData = waitlistRes.data.data;
        }
      } else {
        try {
          const bookingsRes = await api.get(`/public/bookings?date=${formattedDate}`);
          if (bookingsRes.data.success) {
            bookingsData = bookingsRes.data.data;
          }
        } catch (error) {
          console.error("Public bookings endpoint failed:", error);
          bookingsData = [];
        }
      }

      if (venuesRes.data.success) {
        setVenues(venuesRes.data.data);
      }

      setWaitlistEntries(waitlistData);
      setBookings(bookingsData);

      if (branchesRes.data) {
        let branchData = [];
        if (Array.isArray(branchesRes.data)) {
          branchData = branchesRes.data;
        } else if (branchesRes.data.success) {
          branchData = branchesRes.data.data;
        }
        setBranches([...branchData].sort((a, b) =>
          (a.order ?? 0) - (b.order ?? 0) || a.name.trim().localeCompare(b.name.trim(), undefined, { sensitivity: 'base' })
        ));
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

  useEffect(() => {
    socketService.connect(Number(user?.id));
    const socket = socketService.getSocket();

    if (socket) {
      socket.on(
        "bookingUpdate",
        ({ type, data, id }: { type: string; data: Booking; id: string | number }) => {
          const affectedDate = data?.date || null;
          if (affectedDate && affectedDate !== formattedDate) return;

          if (type === "create") {
            setBookings((prev) => [...prev, data]);
          } else if (type === "update") {
            setBookings((prev) => prev.map((b) => (b.id === data.id ? data : b)));
          } else if (type === "delete") {
            setBookings((prev) => prev.filter((b) => b.id !== Number(id)));
          }
        }
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

  const handleConvertToOpenMatch = async (bookingId: number, maxPlayers: number = 4) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/convert-to-open-match`, { maxPlayers });
      if (res.data.success) {
        toast.success("Booking converted to Open Match!");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to convert to Open Match");
    }
  };

  const handleJoinOpenMatch = async (bookingId: number) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/join`);
      if (res.data.success) {
        toast.success("Successfully joined Open Match!");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join Open Match");
    }
  };

  const handleLeaveOpenMatch = async (bookingId: number) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/leave`);
      if (res.data.success) {
        toast.success("Successfully left Open Match!");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to leave Open Match");
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
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    }
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-end gap-4">
        <div className="w-full sm:w-auto flex-1">
          <SponsorCarousel />
        </div>
      </div>

      <div className="mb-6"></div>

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
          onDateChange={(d) => {
            if (d) {
              const newDate = new Date(d);
              newDate.setHours(12, 0, 0, 0);
              setDate(newDate);
              updateUrl(format(newDate, "yyyy-MM-dd"));
            }
          }}
          onBranchChange={(id) => {
            setSelectedBranchId(String(id));
            updateUrl(undefined, String(id));
          }}
        />
      )}

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
                <div className="text-sm font-medium mt-1">{selectedSlot?.time}</div>
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
            <Button variant="outline" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBooking}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <BookingsContent />
    </Suspense>
  );
}
