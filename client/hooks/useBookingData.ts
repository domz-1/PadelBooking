"use client";

import { useState, useEffect, useRef } from "react";
import { adminUserService } from "@/lib/services/admin/users.service";
import { adminVenueService } from "@/lib/services/admin/venues.service";
import {
  adminBookingStatusService,
  BookingStatus,
} from "@/lib/services/admin/bookingStatus.service";
import { User } from "@/lib/schemas";

export function useBookingData(
  open: boolean,
  userSearch: string = "",
  initialUserId?: number,
) {
  const [users, setUsers] = useState<User[]>([]);
  const [venues, setVenues] = useState<
    { id: number; name: string; address?: string }[]
  >([]);
  const [statuses, setStatuses] = useState<BookingStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialUser, setInitialUser] = useState<User | null>(null);

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

  // Reset pagination when search changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [userSearch]);

  // Fetch initial user ONLY once when open and ID exists
  useEffect(() => {
    if (open && initialUserId) {
      adminUserService.getById(initialUserId).then(res => {
        if (res.success && res.data) {
          setInitialUser(res.data);
        }
      }).catch(err => console.error("Failed to fetch initial user", err));
    }
  }, [open, initialUserId]);

  // Fetch users with pagination
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const usersRes = await adminUserService.getAll({
          limit: 10,
          page: page,
          search: userSearch,
        });

        const newUsers = usersRes.data || [];

        setUsers(prev => {
          const userMap = new Map();

          // Should we keep previous users if page > 1?
          if (page > 1) {
            prev.forEach(u => userMap.set(u.id, u));
          }

          // Add new users
          newUsers.forEach(u => userMap.set(u.id, u));

          // ALWAYS ensure initial user is present if they match the search (or maybe just always?)
          // Usually we want the selected user to be visible even if they don't match strict search, 
          // OR we rely on search to find them. 
          // Better UX: If initialUser exists, always parse it in via the Map if it's not there? 
          // The requirement was "get all users get the frist 10 and increas by scrlling".
          // Let's just add initialUser to the map if it exists.
          if (initialUser) {
            userMap.set(initialUser.id, initialUser);
          }

          return Array.from(userMap.values());
        });

        // Determine if there are more users to load
        // Simple check: if we received fewer than limit, or if total list size >= count
        // usersRes.count is total. 
        // We can't easily check total accumulated size vs count because of the Map deduplication.
        // But checking valid API response length < limit is a safe "no more" signal.
        if (newUsers.length < 10) {
          setHasMore(false);
        } else {
          // Also check if we have reached total count? 
          // Ideally backend returns total count.
          // Let's assume safely that if we got 10, there might be more.
          setHasMore(true);
        }

      } catch (error) {
        console.error("Failed to fetch users for booking", error);
        setHasMore(false);
      } finally {
        setUsersLoading(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open, userSearch, page, initialUser]);

  const loadMore = () => {
    if (!usersLoading && hasMore) {
      setPage(p => p + 1);
    }
  };

  return {
    users: users.sort((a, b) => a.name.localeCompare(b.name)), // Client-side sort might be weird with infinite scroll but better than random
    venues,
    statuses,
    loading: loading,
    usersLoading,
    loadMore,
    hasMore
  };
}
