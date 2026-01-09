"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getBookingStatusStyle } from "@/lib/booking-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Booking } from "@/lib/schemas"; // Fixed import

import { useBookingOperations } from "@/hooks/useBookingOperations";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";
import { EditBookingDialog } from "@/components/admin/bookings/EditBookingDialog";
import { BookingDetailsModal } from "@/components/admin/bookings/BookingDetailsModal";

export const columns = (onRefresh: () => void): ColumnDef<Booking>[] => [
  {
    id: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">#{row.original.id}</span>
        {row.original.recurrenceId && (
          <div title="Recurring Booking">
            <RefreshCw className="w-3 h-3 text-primary animate-spin-slow" />
          </div>
        )}
      </div>
    ),
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
      return (
        <span className="text-sm font-medium">{`${booking.startTime} - ${booking.endTime}`}</span>
      );
    },
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
      );
    },
  },
  {
    id: "venue",
    header: "Venue",
    cell: ({ row }) => {
      return (
        <span className="text-sm">{row.original.Venue?.name || "Unknown"}</span>
      );
    },
  },
  {
    id: "branch",
    header: "Branch",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {row.original.Venue?.Branch?.name || "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const booking = row.original;
      const { style, className } = getBookingStatusStyle(booking, false, true);

      return (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border",
            className,
          )}
          style={style}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
          {booking.BookingStatus?.name || booking.status || "Unknown"}
        </div>
      );
    },
  },
  {
    accessorKey: "totalPrice",
    header: "Price",
    cell: ({ row }) => {
      const price = row.original.totalPrice;
      if (price === undefined || price === null) return "-";
      return <span className="font-mono">{Number(price).toFixed(2)} USD</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <BookingActions booking={row.original} onRefresh={onRefresh} />
    ),
  },
];

function BookingActions({
  booking,
  onRefresh,
}: {
  booking: Booking;
  onRefresh: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { deleteBooking } = useBookingOperations();

  const handleDelete = async () => {
    if (!booking.id) return;
    await deleteBooking(booking.id as number, "single", () => {
      onRefresh();
    });
  };

  return (
    <>
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
        onConfirm={handleDelete}
      />

      <BookingDetailsModal
        booking={booking}
        open={showDetails}
        onOpenChange={setShowDetails}
        onSuccess={onRefresh}
      />

      <EditBookingDialog
        booking={booking}
        open={showEdit}
        onOpenChange={setShowEdit}
        onSuccess={onRefresh}
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
          <DropdownMenuItem onClick={() => setShowDetails(true)}>
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowEdit(true)}>
            Edit Booking
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setShowDelete(true)}
            className="text-destructive"
          >
            Delete Booking
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
