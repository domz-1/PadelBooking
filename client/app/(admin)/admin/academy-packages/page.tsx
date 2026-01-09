"use client";

import { useEffect, useState } from "react";
import { coachService } from "@/lib/services/coach.service";
import { adminCoachService } from "@/lib/services/admin/coaches.service";
import { Coach, Package } from "@/lib/types";
import {
  Plus,
  Trash,
  Edit,
  Search,
  Loader2,
  GraduationCap,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AcademyPackagesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await coachService.getAll();
      if (res.success) {
        setCoaches(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch academy data:", error);
      toast.error("Failed to load coaches and packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (pkg?: Package, coachId?: number) => {
    if (pkg) {
      setEditingPackage(pkg);
      setForm({
        name: pkg.name,
        price: pkg.price.toString(),
        description: pkg.description || "",
      });
      setSelectedCoachId(pkg.coachId.toString());
    } else {
      setEditingPackage(null);
      setForm({ name: "", price: "", description: "" });
      setSelectedCoachId(coachId?.toString() || "");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedCoachId || !form.name || !form.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingPackage) {
        await adminCoachService.updatePackage(editingPackage.id, {
          name: form.name,
          price: parseFloat(form.price),
          description: form.description,
        });
        toast.success("Package updated successfully");
      } else {
        await adminCoachService.createPackage({
          coachId: parseInt(selectedCoachId),
          name: form.name,
          price: parseFloat(form.price),
          description: form.description,
        });
        toast.success("Package created successfully");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to save package:", error);
      toast.error("Failed to save package");
    }
  };

  const handleDelete = async (pkgId: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      await adminCoachService.deletePackage(pkgId);
      toast.success("Package deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to delete package:", error);
      toast.error("Failed to delete package");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Academy Programs
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage training packages for your coaches.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" /> Add New Package
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border">
        <Search className="h-5 w-5 text-muted-foreground ml-2" />
        <Input
          placeholder="Search by coach or package name..."
          className="border-none bg-transparent focus-visible:ring-0 px-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {coaches.map((coach) => {
          const filteredPackages =
            coach.packages?.filter(
              (p) =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                coach.User?.name
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()),
            ) || [];

          if (
            searchTerm &&
            filteredPackages.length === 0 &&
            !coach.User?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
            return null;

          return (
            <Card
              key={coach.id}
              className="overflow-hidden border-2 bg-background/50 backdrop-blur-sm group hover:border-primary/50 transition-all duration-300"
            >
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {coach.User?.name?.[0] || "C"}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {coach.User?.name}
                      </CardTitle>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Professional Coach
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleOpenDialog(undefined, coach.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {coach.packages && coach.packages.length > 0 ? (
                    coach.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-6 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-sm">{pkg.name}</h4>
                            <div className="flex items-center gap-1.5 text-primary mt-1">
                              <DollarSign className="h-3 w-3" />
                              <span className="font-black text-sm">
                                {pkg.price.toLocaleString()} EGP
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleOpenDialog(pkg)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDelete(pkg.id)}
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {pkg.description || "No description provided."}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground italic text-xs">
                      No packages for this coach.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Add Academy Package"}
            </DialogTitle>
            <DialogDescription>
              Create or modify a training program for your academy.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-70">
                Select Coach
              </label>
              <Select
                value={selectedCoachId}
                onValueChange={setSelectedCoachId}
                disabled={!!editingPackage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a coach" />
                </SelectTrigger>
                <SelectContent>
                  {coaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.id.toString()}>
                      {coach.User?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-70">
                Package Name
              </label>
              <Input
                placeholder="e.g. 10 Sessions Performance Pack"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-70">
                Price (EGP)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-70">
                Description
              </label>
              <textarea
                className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="What's included in this package?"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
