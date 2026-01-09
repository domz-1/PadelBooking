"use client";

import { useAuthStore } from "@/hooks/use-auth-store";
import { userService } from "@/lib/services/user.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientEditBookingDialog } from "@/components/client-edit-booking-dialog";
import { isPast } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, History, Loader2 } from "lucide-react";
import api, { API_BASE_URL } from "@/lib/api";
import { Booking } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns"; // Added missing import for format

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Dialog States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // Booking Management States
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<number | null>(
    null,
  );

  // Data States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [profileForm, setProfileForm] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  }));
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, router]);

  // Initialize profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user]);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/bookings/my-bookings");
      if (res.data.success) {
        setBookings(res.data.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoadingBookings(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookings();
    }
  }, [isAuthenticated, user, fetchBookings]);

  const { fetchUser } = useAuthStore();

  if (!user) return null;

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("email", profileForm.email);
      formData.append("phone", profileForm.phone);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await userService.updateProfile(formData);
      await fetchUser(); // Refresh user data in Zustand store
      toast.success("Profile updated");
      setIsEditOpen(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      await userService.updatePassword(passwordForm);
      toast.success("Password changed successfully");
      setIsPasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch {
      toast.error("Failed to change password");
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelingBookingId) return;
    try {
      const res = await api.delete(`/bookings/${cancelingBookingId}`);
      if (res.data.success) {
        toast.success("Booking cancelled");
        fetchBookings(); // Re-fetch bookings after cancellation
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelingBookingId(null);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={
                    user.image
                      ? user.image.startsWith("http")
                        ? user.image
                        : `${API_BASE_URL}/${user.image}`
                      : "/images/padel.png"
                  }
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
              >
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={user.name} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} readOnly />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={user.phone || "N/A"} readOnly />
              </div>
              <Button
                variant="link"
                className="p-0"
                onClick={() => setIsPasswordOpen(true)}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Your latest match reservations
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/my-bookings")}
              >
                <History className="w-4 h-4 mr-2" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading bookings...
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings found. Time to play!
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const bookingDateTime = new Date(booking.date);
                    const [hours, minutes] = booking.startTime.split(":");
                    bookingDateTime.setHours(
                      parseInt(hours),
                      parseInt(minutes),
                    );
                    const isPastBooking = isPast(bookingDateTime);

                    return (
                      <div
                        key={booking.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold flex items-center gap-2">
                            {booking.Venue?.name || "Venue"}
                            {isPastBooking ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                Past
                              </Badge>
                            ) : (
                              <Badge
                                variant="default"
                                className="text-[10px] bg-green-600 hover:bg-green-700"
                              >
                                Upcoming
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(booking.date), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {booking.startTime.slice(0, 5)} -{" "}
                              {booking.endTime.slice(0, 5)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {!isPastBooking && booking.status !== "cancelled" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingBooking(booking)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setCancelingBookingId(booking.id)
                                }
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === "cancelled" && (
                            <Badge variant="destructive">Cancelled</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <AlertDialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Update your profile information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-image">Profile Image</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <Button onClick={handleUpdateProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <AlertDialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your current and new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangePassword}>
              Change Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingBooking && (
        <ClientEditBookingDialog
          booking={editingBooking}
          open={!!editingBooking}
          onOpenChange={(open) => !open && setEditingBooking(null)}
          onSuccess={fetchBookings}
        />
      )}

      <AlertDialog
        open={!!cancelingBookingId}
        onOpenChange={() => setCancelingBookingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
