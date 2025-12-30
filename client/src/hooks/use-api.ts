import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Booking, Court, User } from "@/types";

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await api.get<Booking[]>("/bookings");
      return response.data;
    },
  });
}

export function useCourts() {
  return useQuery({
    queryKey: ["courts"],
    queryFn: async () => {
      const response = await api.get<Court[]>("/courts");
      return response.data;
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get<User[]>("/users");
      return response.data;
    },
  });
}
