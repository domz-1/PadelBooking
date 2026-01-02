"use client";

import { useEffect, useState } from "react";
import { sponsorService } from "@/lib/services/sponsor.service";
import { Sponsor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminSponsorsPage() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState("");

    useEffect(() => {
        loadSponsors();
    }, []);

    const loadSponsors = async () => {
        try {
            const res = await sponsorService.getSponsors();
            setSponsors(res.data);
        } catch (error) {
            toast.error("Failed to load sponsors");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!file || !name) {
            toast.error("Name and Image are required");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("image", file);

            await sponsorService.createSponsor(formData);
            toast.success("Sponsor added");
            setIsDialogOpen(false);
            setName("");
            setFile(null);
            loadSponsors();
        } catch (error) {
            toast.error("Failed to add sponsor");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await sponsorService.deleteSponsor(id);
            toast.success("Sponsor deleted");
            loadSponsors();
        } catch (error) {
            toast.error("Failed to delete sponsor");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Sponsors</h2>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Sponsor
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sponsors.map((sponsor) => (
                    <Card key={sponsor.id}>
                        <div className="aspect-video w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img src={sponsor.imageUrl} alt={sponsor.name} className="object-cover h-full w-full" />
                        </div>
                        <CardHeader>
                            <CardTitle>{sponsor.name}</CardTitle>
                        </CardHeader>
                        <CardFooter>
                            <ConfirmDialog
                                title="Delete Sponsor"
                                description="Are you sure you want to delete this sponsor?"
                                onConfirm={() => handleDelete(sponsor.id)}
                            >
                                <Button variant="destructive" size="sm" className="w-full">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </ConfirmDialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Sponsor</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Sponsor Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company Name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo Image</Label>
                            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Add Sponsor</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
