"use strict";
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Match, adminMatchService } from "@/lib/services/admin/matches.service";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const MatchActions = ({ match }: { match: Match }) => {
    const router = useRouter();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await adminMatchService.deleteMatch(match.id);
            toast.success("Match deleted successfully");
            router.refresh();
            // Force reload to update table data if refresh isn't enough (client-side fetch)
            window.location.reload();
        } catch (error) {
            toast.error("Failed to delete match");
        } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <>
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
                        onClick={() => navigator.clipboard.writeText(match.id.toString())}
                    >
                        Copy Match ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete Match
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Delete Match"
                description="Are you sure you want to delete this match? This action cannot be undone."
                variant="destructive"
            />
        </>
    );
};

export const columns: ColumnDef<Match>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("date"));
            return <div>{date.toLocaleDateString()}</div>;
        }
    },
    {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("level")}</div>
        ),
    },
    {
        accessorKey: "players",
        header: "Players",
        cell: ({ row }) => {
            const players = row.original.players || [];
            return <div>{players.length} Players</div>;
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <MatchActions match={row.original} />,
    },
];
