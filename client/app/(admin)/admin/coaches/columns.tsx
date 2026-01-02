"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Coach, coachService } from "@/lib/services/coaches.service"
import { adminCoachService } from "@/lib/services/admin/coaches.service"

export const columns: ColumnDef<Coach>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <span className="text-muted-foreground">#{row.getValue("id")}</span>
    },
    {
        id: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.User?.name || "Unknown"}</span>
    },
    {
        id: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.User?.email || "Unknown"}</span>
    },
    {
        accessorKey: "hourlyRate",
        header: "Rate/Hr",
        cell: ({ row }) => <span className="font-mono">{row.getValue("hourlyRate")} USD</span>
    },
    {
        accessorKey: "experience",
        header: "Experience",
    },
    {
        id: "actions",
        cell: ({ row }) => <CoachActions coach={row.original} />
    },
]

import { ConfirmDialog } from "@/components/ui/confirm-dialog"

function CoachActions({ coach }: { coach: Coach }) {
    const handleDelete = async () => {
        try {
            await adminCoachService.deleteCoach(coach.id);
            window.location.reload();
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <ConfirmDialog
            title="Delete Coach"
            description="Are you sure you want to delete this coach? This might affect their packages."
            onConfirm={handleDelete}
        >
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash className="h-4 w-4" />
            </Button>
        </ConfirmDialog>
    )
}
