
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

export const BranchSchema = z.object({
    id: z.number(),
    name: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    Venues: z.array(z.any()).optional(),
});

export const VenueSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: VenueType.optional(),
    location: z.string().optional(),
    pricePerHour: z.number().optional(),

    contactEmail: z.string().email().optional().or(z.literal('')),
    contactPhone: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),
    branchId: z.number().optional(),
    Branch: BranchSchema.optional(),
});

export const BookingSchema = z.object({
    id: z.number().optional(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    courtId: z.number().optional(),
    venueId: z.number().optional(),
    userId: z.number().optional(),
    status: z.string(),
    statusId: z.number().optional(),
    User: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional()
    }).optional(),
    Venue: z.object({
        name: z.string(),
        type: z.string().optional(),
        Branch: z.object({
            name: z.string()
        }).optional()
    }).optional(),
    totalPrice: z.number().optional(),
    type: z.string().optional(),
    hasOffer: z.boolean().optional(),
    offerValue: z.number().optional(),
    isOpenMatch: z.boolean().optional(),
    openMatchPlayers: z.array(z.number()).optional(),
    openMatchMaxPlayers: z.number().optional(),
    BookingStatus: z.object({
        id: z.number(),
        name: z.string(),
        color: z.string().optional(),
        description: z.string().optional()
    }).optional()
});

export const CreateBookingSchema = z.object({
    venueId: z.number({ message: "Venue is required" }),
    date: z.string({ message: "Date is required" }), // YYYY-MM-DD
    startTime: z.string({ message: "Start time is required" }), // HH:mm
    endTime: z.string({ message: "End time is required" }), // HH:mm
});

// --- Types ---
export type LoginCredentials = z.infer<typeof LoginSchema>;
export type RegisterCredentials = z.infer<typeof RegisterSchema>;
export type User = z.infer<typeof UserSchema>;
export type Venue = z.infer<typeof VenueSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type Branch = z.infer<typeof BranchSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
