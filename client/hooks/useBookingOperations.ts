"use client";

import { useState } from "react";
import { adminBookingService } from "@/lib/services/admin/bookings.service";
import { toast } from "sonner";
import { type Booking, type WaitlistEntry } from "@/lib/schemas";

export type CreateBookingPayload = Partial<Booking> & {
  repeat?: {
    frequency: "weekly" | "daily";
    count: number;
  };
};

export function useBookingOperations() {
  const [loading, setLoading] = useState(false);

  const createBooking = async (
    data: CreateBookingPayload,
    onSuccess?: () => void,
  ) => {
    setLoading(true);
    try {
      await adminBookingService.create(data);
      toast.success("Booking created successfully");
      onSuccess?.();
      return true;
    } catch (error) {
      const message =
        (error as Error & { response?: { data?: { message?: string } } })
          ?.response?.data?.message || "Failed to create booking";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (
    id: number,
    data: Partial<Booking> & { seriesOption?: string },
    onSuccess?: () => void,
  ) => {
    setLoading(true);
    try {
      await adminBookingService.update(id, data);
      toast.success("Booking updated successfully");
      onSuccess?.();
      return true;
    } catch (error) {
      const message =
        (error as Error & { response?: { data?: { message?: string } } })
          ?.response?.data?.message || "Failed to update booking";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (
    id: number,
    seriesOption: string = "single",
    onSuccess?: () => void,
  ) => {
    setLoading(true);
    try {
      await adminBookingService.deleteBooking(id, seriesOption);
      toast.success("Booking deleted successfully");
      onSuccess?.();
      return true;
    } catch (error) {
      const message =
        (error as Error & { response?: { data?: { message?: string } } })
          ?.response?.data?.message || "Failed to delete booking";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const fetchWaitlist = async (params: {
    venueId: number;
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      const res = await adminBookingService.getWaitlistForSlot(params);
      setWaitlist(res.data);
    } catch (error) {
      console.error("Failed to fetch waitlist", error);
    }
  };

  const joinWaitlist = async (
    data: {
      userId: number;
      venueId: number;
      date: string;
      startTime: string;
      endTime: string;
    },
    onSuccess?: () => void,
  ) => {
    setLoading(true);
    try {
      await adminBookingService.joinWaitlist(data);
      toast.success("User added to waitlist");
      onSuccess?.();
      return true;
    } catch (error) {
      const message =
        (error as Error & { response?: { data?: { message?: string } } })
          ?.response?.data?.message || "Failed to add user to waitlist";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteWaitlistEntry = async (id: number, onSuccess?: () => void) => {
    try {
      await adminBookingService.deleteWaitlistEntry(id);
      toast.success("User removed from waitlist");
      onSuccess?.();
      return true;
    } catch {
      toast.error("Failed to remove user");
    }
  };

  return {
    loading,
    createBooking,
    updateBooking,
    deleteBooking,
    waitlist,
    fetchWaitlist,
    joinWaitlist,
    deleteWaitlistEntry,
  };
}
