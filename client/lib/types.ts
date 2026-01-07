export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "coach";
  avatar?: string;
  image?: string;
  level?: "beginner" | "intermediate" | "advanced" | "pro";
  phone?: string;
  stats?: { played: number; won: number; lost: number };
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: number;
  name: string;
  description?: string;
  location: string;
  pricePerHour: number;
  type: "indoor" | "outdoor";
  image?: string;
  bookings?: Booking[];
  Branch?: {
    id: number;
    name: string;
  };
}

export interface WaitlistEntry {
  id: number;
  userId: number;
  venueId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  User?: User;
  Venue?: Venue;
}

export interface Booking {
  id: number;
  // userId is number or string depending on backend. Model says User belongsTo, usually integer ID in Postgres
  userId: number;
  venueId: number;
  date: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  matchResult?: {
    score?: string;
    winner?: number;
  };
  status:
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no-show"
  | "pending-coach";
  type: "standard" | "academy";
  totalPrice: number;
  participants: number[];
  categoryId?: number;
  User?: User;
  Venue?: Venue;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  type: "sale" | "rental";
  stock: number;
  images?: string[];
}

export interface Match {
  id: number;
  venueId: number;
  date: string;
  startTime: string;
  endTime: string;
  level?: string;
  finderId: number;
  players: number[];
  isOpen: boolean;
}

export interface Coach {
  id: number;
  userId: number;
  bio?: string;
  experience?: string;
  User?: User;
  packages?: Package[];
}

export interface Package {
  id: number;
  coachId: number;
  name: string;
  price: number;
  description?: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  validUntil?: string;
}

export interface Sponsor {
  id: number;
  name: string;
  image: string;
  link: string;
  isActive: boolean;
  showInHome: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sport {
  id: number;
  name: string;
}

export interface Story {
  id: number;
  userId: number;
  media: string;
  caption?: string;
  expiresAt: string;
  User?: User;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  totalPages?: number;
  currentPage?: number;
  data: T[];
}

export interface BookingLog {
  id: number;
  bookingId: number;
  userId?: number | null;
  action: string;
  description?: string | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  details?: Record<string, unknown> | null;
  timestamp: string;
  User?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
