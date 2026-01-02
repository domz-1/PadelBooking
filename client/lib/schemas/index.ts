
import { z } from "zod";

// --- Enums ---
export const BookingStatus = z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'pending-coach']);
export const VenueType = z.enum(['standard', 'premium', 'indoor', 'outdoor']).or(z.string());

// --- Schemas ---

export const UserSchema = z.object({
    id: z.number().or(z.string()),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.string(),
});

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const VenueSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: VenueType.optional(),
    pricePerHour: z.number().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
});

export const BookingSchema = z.object({
    id: z.number(),
    date: z.string(), // YYYY-MM-DD
    startTime: z.string(), // HH:mm
    endTime: z.string(), // HH:mm
    status: BookingStatus.default('pending'),
    venueId: z.number(),
    userId: z.number(),
    User: UserSchema.optional(),
    Venue: VenueSchema.optional(),
    type: z.string().optional(),
    totalPrice: z.number().optional()
});

export const CreateBookingSchema = z.object({
    venueId: z.number({ message: "Venue is required" }),
    date: z.string({ message: "Date is required" }), // YYYY-MM-DD
    startTime: z.string({ message: "Start time is required" }), // HH:mm
    endTime: z.string({ message: "End time is required" }), // HH:mm
});

// --- Types ---
export type User = z.infer<typeof UserSchema>;
export type LoginCredentials = z.infer<typeof LoginSchema>;
export type RegisterCredentials = z.infer<typeof RegisterSchema>;
export type Venue = z.infer<typeof VenueSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
