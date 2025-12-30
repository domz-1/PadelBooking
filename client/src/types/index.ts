export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "player" | "staff";
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  courtId: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Court {
  id: string;
  name: string;
  type: "indoor" | "outdoor";
  pricePerHour: number;
  isAvailable: boolean;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
