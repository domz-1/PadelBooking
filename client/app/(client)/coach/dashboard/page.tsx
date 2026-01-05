"use client";

import { useEffect, useState } from "react";
import { coachService } from "@/lib/services/coach.service";
import { useAuthStore } from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function CoachDashboardPage() {
  const { user } = useAuthStore();

  // Profile State
  const [profile, setProfile] = useState({ bio: "", experience: "" });

  // Packages State
  const [newPackage, setNewPackage] = useState({ name: "", price: "" });

  useEffect(() => {
    // Load existing profile if needed
  }, []);

  const handleCreateProfile = async () => {
    try {
      await coachService.createProfile(profile);
      toast.success("Coach profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleCreatePackage = async () => {
    if (!newPackage.name || !newPackage.price) return;
    try {
      await coachService.createPackage({
        name: newPackage.name,
        price: parseFloat(newPackage.price),
      });
      toast.success("Package added");
      setNewPackage({ name: "", price: "" });
      // Reload packages
    } catch {
      toast.error("Failed to add package");
    }
  };

  if (user?.role !== "coach" && user?.role !== "admin") {
    return (
      <div className="p-8 text-center text-red-500">
        Access Restricted: Coaches Only
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Coach Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>My Coach Profile</CardTitle>
            <CardDescription>Update your public information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Experience</Label>
              <Input
                placeholder="e.g., 5 years, Former Pro"
                value={profile.experience}
                onChange={(e) =>
                  setProfile({ ...profile, experience: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Tell students about yourself..."
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                rows={4}
              />
            </div>
            <Button onClick={handleCreateProfile} className="w-full">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Packages Section */}
        <Card>
          <CardHeader>
            <CardTitle>My Packages</CardTitle>
            <CardDescription>Manage your training packages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              <h4 className="font-semibold text-sm">Add New Package</h4>
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Package Name</Label>
                  <Input
                    placeholder="e.g., 1 Hour 1-on-1"
                    value={newPackage.name}
                    onChange={(e) =>
                      setNewPackage({ ...newPackage, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price ($)</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={newPackage.price}
                    onChange={(e) =>
                      setNewPackage({ ...newPackage, price: e.target.value })
                    }
                  />
                </div>
                <Button size="sm" onClick={handleCreatePackage}>
                  <Plus className="mr-2 h-4 w-4" /> Add Package
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Active Packages</h4>
              <div className="text-sm text-gray-500 italic">
                {/* Map packages here */}
                No packages added yet.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
