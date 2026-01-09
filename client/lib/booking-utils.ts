import { Booking, User, WaitlistEntry, BookingStatus } from "@/lib/schemas";
import { type ClassValue } from "clsx";

export const formatHour = (hour: number): string => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return `${h}:00 ${ampm}`;
};

export const formatTimeForValue = (hour: number): string => {
    const h = hour.toString().padStart(2, "0");
    return `${h}:00`;
};

export const getBookingByVenueAndHour = (
    bookings: Booking[],
    venueId: number,
    hour: number
): Booking | undefined => {
    return bookings.find((b) => {
        if (b.venueId !== venueId) return false;
        const [startHour] = b.startTime.split(":").map(Number);
        let [endHour] = b.endTime.split(":").map(Number);

        // Handle midnight wraparound
        if (endHour === 0 && startHour > endHour) {
            endHour = 24;
        }

        return hour >= startHour && hour < endHour;
    });
};

export const isStartOfBooking = (
    booking: Booking | undefined | null,
    hour: number
): boolean => {
    if (!booking) return false;
    const [startHour] = booking.startTime.split(":").map(Number);
    return startHour === hour;
};

export const getWaitlistEntry = (
    waitlistEntries: WaitlistEntry[],
    venueId: number,
    hour: number,
    date: string
): WaitlistEntry | undefined => {
    const timeStr = formatTimeForValue(hour);
    return waitlistEntries.find((w) => {
        if (Number(w.venueId) !== Number(venueId)) return false;
        if (w.date !== date) return false;
        const wTime = w.startTime.substring(0, 5);
        return wTime === timeStr;
    });
};

export const isOwnBooking = (booking: Booking, user: User | null): boolean => {
    if (!user) return false;
    return String(booking.userId) === String(user.id);
};

export const isUserInOpenMatch = (
    booking: Booking,
    user: User | null
): boolean => {
    if (!booking.openMatchPlayers || !user) return false;
    return booking.openMatchPlayers.some((id) => String(id) === String(user.id));
};

export const getOpenMatchPlayerCount = (booking: Booking): number => {
    if (!booking.openMatchPlayers) return 0;
    return booking.openMatchPlayers.length;
};

interface StatusStyle {
    className?: string;
    style?: React.CSSProperties;
}

export const getBookingStatusStyle = (
    booking: Booking,
    isOwn: boolean,
    isAdmin: boolean
): StatusStyle => {
    if (booking.type === "clocked") {
        return {
            className:
                "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 repeating-linear-gradient-stripe cursor-not-allowed",
        };
    }

    if (!isOwn && !isAdmin)
        return {
            className: "bg-primary/90 text-primary-foreground border-primary",
        };

    if (booking.BookingStatus?.color) {
        const color = booking.BookingStatus.color;
        return {
            style: {
                backgroundColor: `color-mix(in srgb, ${color}, transparent 87%)`,
                color: color,
                borderColor: `color-mix(in srgb, ${color}, transparent 73%)`,
            },
            className: "hover:bg-opacity-20",
        };
    }

    const colors: Record<string, string> = {
        confirmed:
            "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        pending:
            "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
        cancelled: "bg-red-100 text-red-800 border-red-200",
        "pending-coach":
            "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
        "no-show": "bg-gray-100 text-gray-800 border-gray-200",
        completed: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200",
    };
    const statusKey = (booking.status as string) || "pending";
    return { className: colors[statusKey] || colors.pending };
};
