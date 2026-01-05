"use client";

import { useEffect, useState } from "react";
import { sponsorService } from "@/lib/services/sponsor.service";
import { Sponsor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Eye, Edit } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Image from "next/image";

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editName, setEditName] = useState("");
  const [editLink, setEditLink] = useState("");

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      const res = await sponsorService.getSponsors();
      setSponsors(res.data);
    } catch {
      toast.error("Failed to load sponsors");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!file || !name || !link) {
      toast.error("Name, Image, and Link are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("link", link);
      formData.append("image", file);

      await sponsorService.createSponsor(formData);
      toast.success("Sponsor added");
      setIsDialogOpen(false);
      setName("");
      setLink("");
      setFile(null);
      loadSponsors();
    } catch {
      toast.error("Failed to add sponsor");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await sponsorService.deleteSponsor(id);
      toast.success("Sponsor deleted");
      loadSponsors();
    } catch {
      toast.error("Failed to delete sponsor");
    }
  };

  const handleView = async (sponsor: Sponsor) => {
    try {
      const res = await sponsorService.getSponsor(sponsor.id);
      setSelectedSponsor(res.data);
      setViewDialogOpen(true);
    } catch {
      toast.error("Failed to load sponsor details");
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setEditName(sponsor.name);
    setEditLink(sponsor.link);
    setEditFile(null);
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedSponsor || !editName || !editLink) {
      toast.error("Name and Link are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("link", editLink);
      if (editFile) {
        formData.append("image", editFile);
      }

      await sponsorService.updateSponsor(selectedSponsor.id, formData);
      toast.success("Sponsor updated");
      setEditDialogOpen(false);
      setSelectedSponsor(null);
      setEditName("");
      setEditLink("");
      setEditFile(null);
      loadSponsors();
    } catch {
      toast.error("Failed to update sponsor");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );

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
              <Image
                src={sponsor.image}
                alt={sponsor.name}
                width={400}
                height={225}
                className="object-cover h-full w-full"
              />
            </div>
            <CardHeader>
              <CardTitle>{sponsor.name}</CardTitle>
            </CardHeader>
            <CardFooter>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(sponsor)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(sponsor)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </div>
                <ConfirmDialog
                  title="Delete Sponsor"
                  description="Are you sure you want to delete this sponsor?"
                  onConfirm={() => handleDelete(sponsor.id)}
                >
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </ConfirmDialog>
              </div>
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
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Website Link</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Logo Image</Label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Add Sponsor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sponsor Details</DialogTitle>
          </DialogHeader>
          {selectedSponsor && (
            <div className="space-y-6 py-4">
              <div className="flex justify-center">
                <div className="w-48 h-48 overflow-hidden bg-gray-100 rounded-lg border flex items-center justify-center">
                  <Image
                    src={selectedSponsor.image}
                    alt={selectedSponsor.name}
                    width={192}
                    height={192}
                    className="object-contain h-full w-full max-w-full max-h-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Sponsor Name
                  </Label>
                  <p className="text-lg font-semibold">
                    {selectedSponsor.name}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Website
                  </Label>
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedSponsor.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Visit Website
                    </a>
                    {/* <span className="text-sm text-gray-500">
                      ({selectedSponsor.link})
                    </span> */}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Created Date
                  </Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedSponsor.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sponsor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sponsor Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Website Link</Label>
              <Input
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Logo Image (optional)</Label>
              <Input
                type="file"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
              />
              {editFile && (
                <p className="text-sm text-gray-600">
                  New image selected: {editFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Sponsor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
