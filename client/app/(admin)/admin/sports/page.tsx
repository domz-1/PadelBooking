"use client";

import { useEffect, useState } from "react";
import { sportService } from "@/lib/services/sport.service";
import { Sport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Trash2, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminSportsPage() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSportName, setNewSportName] = useState("");

    useEffect(() => {
        loadSports();
    }, []);

    const loadSports = async () => {
        try {
            const res = await sportService.getSports();
            setSports(res.data);
        } catch (error) {
            toast.error("Failed to load sports");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newSportName) return;
        try {
            await sportService.createSport({ name: newSportName });
            toast.success("Sport added");
            setNewSportName("");
            loadSports();
        } catch (error) {
            toast.error("Failed to add sport");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await sportService.deleteSport(id);
            toast.success("Sport deleted");
            loadSports();
        } catch (error) {
            toast.error("Failed to delete sport");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Sports</h2>

            <div className="flex gap-4 items-end max-w-sm">
                <div className="w-full space-y-2">
                    <Input
                        placeholder="New Sport Name"
                        value={newSportName}
                        onChange={(e) => setNewSportName(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4" /> Add
                </Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-900 max-w-2xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Activity Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sports.map((sport) => (
                            <TableRow key={sport.id}>
                                <TableCell className="font-medium">{sport.name}</TableCell>
                                <TableCell className="text-right">
                                    <ConfirmDialog
                                        title="Delete Sport"
                                        description="Are you sure you want to delete this sport?"
                                        onConfirm={() => handleDelete(sport.id.toString())}
                                    >
                                        <Button variant="ghost" size="icon" className="text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </ConfirmDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
