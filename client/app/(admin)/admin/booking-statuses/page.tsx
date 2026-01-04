"use client"

import { BookingStatusManagement } from "@/components/admin/settings/BookingStatusManagement"

export default function AdminBookingStatusesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Booking Statuses</h2>
                <p className="text-muted-foreground">Manage booking status types, colors, and descriptions.</p>
            </div>
            
            <BookingStatusManagement />
        </div>
    )
}