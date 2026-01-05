"use client";

import { useState, useEffect, useRef } from "react";
import { adminUserService } from "@/lib/services/admin/users.service";
import { adminVenueService } from "@/lib/services/admin/venues.service";
import {
  adminBookingStatusService,
  BookingStatus,
} from "@/lib/services/admin/bookingStatus.service";
import { User } from "@/lib/schemas";

export function useBookingData(open: boolean, userSearch: string = "") {
  const [users, setUsers] = useState<User[]>([]);
  const [venues, setVenues] = useState<
    { id: number; name: string; address?: string }[]
  >([]);
  const [statuses, setStatuses] = useState<BookingStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  // Track if static data has been initialised
  const staticDataFetched = useRef(false);

  // Fetch static data (venues, statuses) once when open
  useEffect(() => {
    const fetchStaticData = async () => {
      setLoading(true);
      try {
        const [venuesRes, statusesRes] = await Promise.all([
          adminVenueService.getAll({ limit: 100 }),
          adminBookingStatusService.getAll(),
        ]);
        setVenues(venuesRes.data || []);
        setStatuses(statusesRes.data || []);
        staticDataFetched.current = true;
      } catch (error) {
        console.error("Failed to fetch static booking data", error);
      } finally {
        setLoading(false);
      }
    };

    if (open && !staticDataFetched.current) {
      fetchStaticData();
    }
  }, [open]);

  // Fetch users when search changes or when opening
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const usersRes = await adminUserService.getAll({
          limit: 50,
          search: userSearch,
        });

        // Use a Map to ensure unique users by ID
        const userMap = new Map();
        usersRes.data.forEach((u: User) => {
          if (u && u.id !== undefined) {
            userMap.set(Number(u.id), u);
          }
        });

        setUsers(Array.from(userMap.values()));
      } catch (error) {
        console.error("Failed to fetch users for booking", error);
      } finally {
        setUsersLoading(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open, userSearch]);

  return {
    users,
    venues,
    statuses,
    loading: loading || usersLoading,
    usersLoading,
  };
}
