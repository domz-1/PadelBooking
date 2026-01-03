import { adminApi } from "@/lib/api";

export interface DashboardStats {
    totalUsers: number;
    totalBookings: number;
    totalVenues: number;
    activeMatches: number;
    totalRevenue: number;
    specificDayRevenue: number;
    trend: { day: string; count: number }[];
    insights: {
        utilization: number;
        utilizationTrend: string;
        bookings: number;
        bookingsTrend: string;
        users: number;
        usersTrend: string;
        paidBookings: number;
        paidBookingsTrend: string;
        busiestTime: string;
        utilizationByWeekday: { day: string; value: number }[];
        utilizationByTimeOfWeek: { Morning: number; Afternoon: number; Evening: number };
        durationBreakdown: { '1h': number; '1.5h': number; '2h+': number };
        topUsers: {
            name: string;
            bookings: number;
            paidBookings: number;
            hours: string;
            trend: string;
        }[];
        topSpaces: {
            name: string;
            bookings: number;
            utilization: string;
            trend: string;
        }[];
    };
}

export interface AvailableSlotsRequest {
    date: string;
    startTime?: string;
    endTime?: string;
    branchId?: number;
}

export const metricsService = {
    getStats: async (date?: string) => {
        const response = await adminApi.get<{ success: boolean; data: DashboardStats }>('/metrics/stats', { params: { date } });
        return response.data;
    },

    getAvailableSlots: async (params: AvailableSlotsRequest) => {
        const response = await adminApi.get<{ success: boolean; data: Record<string, Record<string, { start: string; end: string }[]>> }>('/metrics/available-slots', { params });
        return response.data;
    }
};
