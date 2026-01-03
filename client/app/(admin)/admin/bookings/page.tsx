"use client"

import { useEffect, useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { adminBookingService } from "@/lib/services/admin/bookings.service"
import { adminBranchService } from "@/lib/services/admin/branches.service"
import type { Booking, Branch } from "@/lib/schemas"
import { Venue, adminVenueService } from "@/lib/services/admin/venues.service"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import BookingGrid from "@/components/bookings/BookingGrid"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"
import { FileUploadDialog } from "@/components/ui/file-upload-dialog"
import { socketService } from "@/lib/socket"
import { useAuthStore } from "@/hooks/use-auth-store"

export default function BookingsPage() {
    const { user } = useAuthStore()
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [data, setData] = useState<Booking[]>([])
    const [venues, setVenues] = useState<Venue[]>([])
    const [branches, setBranches] = useState<Branch[]>([]) // Added branches state
    const [loading, setLoading] = useState(true)

    // Pagination state for List View
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [totalBookings, setTotalBookings] = useState(0)

    // Fetch Bookings
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true)
            try {
                // Formatting date for API
                const dateStr = date ? date.toISOString().split('T')[0] : undefined;

                const response = await adminBookingService.getAll({
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    date: dateStr
                });
                setData(response.data)
                setTotalBookings(response.count)
            } catch (error) {
                console.error("Failed to fetch bookings", error)
            } finally {
                setLoading(false)
            }
        }

        fetchBookings()
    }, [pagination, date]) // Re-fetch when date changes

    // Real-time updates listener
    useEffect(() => {
        socketService.connect(Number(user?.id));
        const socket = socketService.getSocket();

        if (socket) {
            socket.on("bookingUpdate", ({ type, data, id }: any) => {
                const affectedDate = data?.date || null;
                const currentDateStr = date ? date.toISOString().split('T')[0] : null;

                // If we are filtering by date, only update if it matches
                if (currentDateStr && affectedDate && affectedDate !== currentDateStr) return;

                if (type === 'create') {
                    setData(prev => [data, ...prev]);
                    setTotalBookings(prev => prev + 1);
                } else if (type === 'update') {
                    setData(prev => prev.map(b => b.id === data.id ? data : b));
                } else if (type === 'delete') {
                    setData(prev => prev.filter(b => b.id !== Number(id)));
                    setTotalBookings(prev => prev - 1);
                }
            });
        }

        return () => {
            if (socket) socket.off("bookingUpdate");
        };
    }, [date, user?.id]);

    // Fetch Venues and Branches for Grid
    useEffect(() => {
        const fetchGridData = async () => {
            try {
                const [venuesRes, branchesRes] = await Promise.all([
                    adminVenueService.getAll({ limit: 100 }),
                    adminBranchService.getAll()
                ]);
                setVenues(venuesRes.data);
                setBranches(branchesRes || []);
            } catch (e) {
                console.error(e);
            }
        }
        // Always fetch venues/branches if we might switch to grid, or just when mode changes
        if (viewMode === 'grid' && venues.length === 0) {
            fetchGridData()
        }
    }, [viewMode, venues.length])

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-2 md:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Bookings Management</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage bookings, view schedule, and check availability.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <FileUploadDialog
                        title="Import Bookings"
                        onUpload={adminBookingService.importBookings}
                        description="Upload a CSV or Excel file with columns: branchName, venueName, userEmail, date, startTime, endTime"
                    />
                    <DatePicker
                        date={date}
                        setDate={(d) => {
                            if (d) {
                                const newDate = new Date(d);
                                newDate.setHours(12, 0, 0, 0); // Normalize to noon
                                setDate(newDate);
                            } else {
                                setDate(undefined);
                            }
                        }}
                        className="w-full sm:w-[200px]"
                    />

                    <div className="flex items-center space-x-1 bg-secondary p-1 rounded-md border">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="px-3"
                        >
                            <List className="w-4 h-4 mr-2" /> List
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="px-3"
                        >
                            <LayoutGrid className="w-4 h-4 mr-2" /> Grid
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 border rounded-lg bg-card shadow-sm overflow-hidden">
                {viewMode === 'list' ? (
                    <div className="h-full p-4 overflow-auto">
                        <DataTable
                            columns={columns}
                            data={data}
                            pageCount={Math.ceil(totalBookings / pagination.pageSize)}
                            pagination={pagination}
                            onPaginationChange={setPagination}
                        />
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b bg-muted/20">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold flex items-center gap-2">
                                    Schedule for {date ? date.toLocaleDateString() : 'All Time'}
                                </h2>
                                {/* Legend or Stat could go here */}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <BookingGrid
                                bookings={data as any}
                                venues={venues as any}
                                branches={branches}
                                date={date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                onCreateBooking={() => { }}
                                onViewBooking={(b) => console.log(b)}
                                publicView={false}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
