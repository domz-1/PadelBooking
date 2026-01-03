"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Branch } from "@/lib/schemas"
import { adminBranchService } from "@/lib/services/admin/branches.service"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"

export const columns: ColumnDef<Branch>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
            return row.original.location || "N/A"
        }
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive")
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <BranchActions branch={row.original} />
    },
]

function BranchActions({ branch }: { branch: Branch }) {
    const router = useRouter()
    const [showDelete, setShowDelete] = useState(false)

    const handleDelete = async () => {
        try {
            if (branch.id) {
                await adminBranchService.delete(branch.id)
                toast.success("Branch deleted successfully")
                window.location.reload()
            }
        } catch (error) {
            toast.error("Failed to delete branch")
            console.error(error)
        }
    }

    return (
        <>
            <ConfirmDialog
                open={showDelete}
                onOpenChange={setShowDelete}
                title="Delete Branch"
                description="Are you sure you want to delete this branch? This action cannot be undone."
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
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(branch.id))}>
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(`/admin/branches/${branch.id}`)}>
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/admin/branches/${branch.id}/edit`)}>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowDelete(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
