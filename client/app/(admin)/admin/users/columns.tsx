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
import { User, adminUserService } from "@/lib/services/admin/users.service" // Adjust import path
import { Badge } from "@/components/ui/badge"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const user = row.original;
            const isGuest = user.email.includes('@temp.local') || user.name.startsWith('Guest_');
            return (
                <div>
                    <div className="font-medium">{user.name}</div>
                    {isGuest && <div className="text-xs text-muted-foreground italic">Guest User</div>}
                </div>
            )
        }
    },
    {
        id: "type",
        header: "Type",
        cell: ({ row }) => {
            const user = row.original;
            const isGuest = user.email.includes('@temp.local') || user.name.startsWith('Guest_');
            return (
                <Badge variant={isGuest ? "outline" : "secondary"}>
                    {isGuest ? "Guest" : "Registered"}
                </Badge>
            )
        }
    },
    {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex flex-col text-sm">
                    <span>{user.email}</span>
                    {user.phone && <span className="text-muted-foreground text-xs">{user.phone}</span>}
                </div>
            )
        }
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <span className="capitalize">{row.getValue("role")}</span>
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const active = row.getValue("isActive");
            return (
                <Badge variant={active ? "default" : "destructive"}>
                    {active ? "Active" : "Banned"}
                </Badge>
            );
        }
    },
    {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => {
            return new Date(row.getValue("createdAt") as string).toLocaleDateString();
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <UserActions user={row.original} />
    },
]

import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useState } from "react"

function UserActions({ user }: { user: User }) {
    const [showDelete, setShowDelete] = useState(false)
    const [showBan, setShowBan] = useState(false)

    const handleDelete = async () => {
        try {
            await adminUserService.deleteUser(user.id);
            window.location.reload();
        } catch (e) {
            console.error(e)
        }
    }

    const handleBan = async () => {
        try {
            await adminUserService.banUser(user.id);
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
                title="Delete User"
                description="Are you sure you want to delete this user?"
                onConfirm={handleDelete}
            />
            <ConfirmDialog
                open={showBan}
                onOpenChange={setShowBan}
                title={user.isActive ? "Ban User" : "Activate User"}
                description={`Are you sure you want to ${user.isActive ? 'ban' : 'activate'} this user?`}
                onConfirm={handleBan}
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
                        onClick={() => navigator.clipboard.writeText(user.id.toString())}
                    >
                        Copy User ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = `/admin/users/${user.id}`}>View details</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setShowBan(true)} className={user.isActive ? "text-destructive" : "text-green-600"}>
                        {user.isActive ? "Ban User" : "Activate User"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setShowDelete(true)} className="text-destructive">Delete User</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
