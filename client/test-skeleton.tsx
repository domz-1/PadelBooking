"use client"

import { BookingSkeleton } from "./components/ui/booking-skeleton"

export default function TestSkeleton() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Booking Skeleton Test</h1>
            <BookingSkeleton />
        </div>
    )
}