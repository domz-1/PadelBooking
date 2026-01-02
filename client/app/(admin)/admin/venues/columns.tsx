"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, MapPin, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Venue, adminVenueService } from "@/lib/services/admin/venues.service"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Venue>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <span className="text-muted-foreground">#{row.getValue("id")}</span>
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
            <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                {row.getValue("location")}
            </div>
        )
    },
    {
        accessorKey: "pricePerHour",
        header: "Price/Hour",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("pricePerHour"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(price)
            return <span className="font-mono">{formatted}</span>
        }
    },
    {
        accessorKey: "courts",
        header: "Courts",
        cell: ({ row }) => (
            <Badge variant="outline">{row.getValue("courts") || 0} Courts</Badge>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => <VenueActions venue={row.original} />
    },
]

import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useState } from "react"

function VenueActions({ venue }: { venue: Venue }) {
    const [showDelete, setShowDelete] = useState(false)

    const handleDelete = async () => {
        try {
            await adminVenueService.delete(venue.id); // Note: Service method is delete, not deleteVenue (checked earlier offers service but let's check venue service usage below)
            // Wait, previous code used adminVenueService.delete(venue.id);
            // I should use exactly what was there.
            // The file View says: await adminVenueService.delete(venue.id);
            // My failed attempt used deleteVenue(venue.id). I should correction that too.
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
                title="Delete Venue"
                description="Are you sure you want to delete this venue?"
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
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(venue.id.toString())}
                    >
                        Copy Venue ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = `/admin/venues/${venue.id}`}>View details</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/admin/venues/${venue.id}/edit`}>Edit Venue</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setShowDelete(true)} className="text-destructive">Delete Venue</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
