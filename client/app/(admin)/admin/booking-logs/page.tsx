import { AllBookingLogs } from "@/components/admin/bookings/AllBookingLogs"

export default function BookingLogsPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-2 md:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Booking Activity Logs</h1>
                    <p className="text-sm text-muted-foreground">
                        Track all booking activities across the system with detailed logs.
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0 border rounded-lg bg-card shadow-sm overflow-hidden p-4">
                <AllBookingLogs />
            </div>
        </div>
    )
}