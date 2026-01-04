"use client"

import { cn } from "@/lib/utils"

export function BookingSkeleton() {
    return (
        <div className="w-full space-y-4">
            {/* Branch Selector Skeleton */}
            <div className="flex justify-center">
                <div className="w-64 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>

            {/* Create Open Match Button Skeleton */}
            <div className="flex justify-end mb-4">
                <div className="w-48 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>

            <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-4">
                <div className="w-full">
                    {/* Make grid full width of container, but minimum width to prevent squishing */}
                    <div className="min-w-[1000px] w-full">
                        {/* Header Row Skeleton */}
                        <div className="grid gap-2 mb-2 sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur py-2" style={{ gridTemplateColumns: `80px repeat(4, 1fr)` }}>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>

                        {/* Grid Rows Skeleton */}
                        {Array.from({ length: 12 }).map((_, hourIndex) => (
                            <div key={hourIndex} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `80px repeat(4, 1fr)` }}>
                                {/* Time Cell Skeleton */}
                                <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>

                                {/* Venue Cells Skeleton */}
                                {Array.from({ length: 4 }).map((_, venueIndex) => (
                                    <div key={venueIndex} className="h-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse border border-gray-200 dark:border-gray-700"></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}