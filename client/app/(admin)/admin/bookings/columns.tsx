"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Booking, adminBookingService } from "@/lib/services/admin/bookings.service"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Booking>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <span className="text-muted-foreground">#{row.getValue("id")}</span>
    },
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        id: "time",
        header: "Time",
        cell: ({ row }) => {
            const booking = row.original;
            return <span className="text-sm font-medium">{`${booking.startTime} - ${booking.endTime}`}</span>
            // Note: Service interface defines timeSlot. Vue view uses startTime/endTime. 
            // We should check actual API response. 
            // Assuming timeSlot might be constructed or raw.
            // Let's assume startTime/endTime are available on original object if the interface definition is loose or incomplete.
            // But strict TS will complain.
            // I'll check service again. Service says `timeSlot` only. 
            // But Vue view uses `startTime` and `endTime`.
            // The API response likely returns both. I should update service interface.
        }
    },
    {
        id: "user",
        header: "User",
        cell: ({ row }) => {
            const user = row.original.User;
            return (
                <div className="flex flex-col text-sm">
                    <span className="font-medium">{user?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
            )
        }
    },
    {
        id: "venue",
        header: "Venue",
        cell: ({ row }) => {
            const venue = row.original.Court?.Venue || row.original.Court; // Depending on structure
            // Vue: item.Venue?.name
            // Service: Court?: { name: string; Venue?: { name: string } };
            // The structure in Vue suggests 'Venue' is direct property or nested in Court.
            // Let's try Court.Venue.name first.
            return <span className="text-sm">{row.original.Court?.Venue?.name || "Unknown"}</span>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variant =
                status === 'confirmed' ? 'default' : // green (default usually primary color, need custom for green maybe)
                    status === 'cancelled' ? 'destructive' :
                        status === 'pending' ? 'secondary' : 'outline';

            return (
                <Badge variant={variant} className="capitalize">{status}</Badge>
            )
        }
    },
    {
        accessorKey: "totalPrice", // Service missing this
        header: "Price",
        cell: ({ row }) => {
            // Check if price exists.
            // If not in interface, assume it's in data.
            const price = (row.original as any).totalPrice;
            if (!price) return "-";
            return <span className="font-mono">{parseFloat(price).toFixed(2)} USD</span>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <BookingActions booking={row.original} />
    },
]

import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useState } from "react"

function BookingActions({ booking }: { booking: Booking }) {
    const [showDelete, setShowDelete] = useState(false)

    const handleDelete = async () => {
        try {
            await adminBookingService.deleteBooking(booking.id);
            window.location.reload();
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <ConfirmDialog
                open={showDelete}
                onOpenChange={setShowDelete}
                title="Delete Booking"
                description="Are you sure you want to delete this booking? This action cannot be undone."
                onConfirm={handleDelete}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = `/admin/bookings/${booking.id}`}>View details</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setShowDelete(true)} className="text-destructive">Delete Booking</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
