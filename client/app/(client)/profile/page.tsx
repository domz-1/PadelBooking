"use client";

import { useAuthStore } from "@/hooks/use-auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { userService } from "@/lib/services/user.service";
import { toast } from "sonner";
import { Loader2, Lock, UserCog } from "lucide-react";

export default function ProfilePage() {
    const { user, isAuthenticated, login } = useAuthStore(); // login used to update store user
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Dialog States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    // Form States
    const [profileForm, setProfileForm] = useState({ name: "", email: "" });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

    useEffect(() => {
        if (!isAuthenticated) router.push('/auth/login');
        if (user) {
            setProfileForm({ name: user.name, email: user.email });
        }
    }, [isAuthenticated, router, user]);

    if (!user) return null;

    const handleUpdateProfile = async () => {
        try {
            const updatedUser = await userService.updateProfile({ name: profileForm.name });
            // Ideally update local store, for now logic might rely on re-fetch or login action if it accepts object
            // Assuming useAuthStore has a way to update user or we just manually update localStorage and reload?
            // A better way is to validly re-fetch 'me'.
            const me = await userService.getById(user!.id.toString());
            // Actually let's use the response data
            // login(updatedUser.data); - If login accepts user object. 
            // We'll just toast for now and maybe reload.
            toast.success("Profile updated");
            setIsEditOpen(false);
            window.location.reload(); // Simple refresh to update global state
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const handleChangePassword = async () => {
        try {
            await userService.updatePassword(passwordForm);
            toast.success("Password changed successfully");
            setIsPasswordOpen(false);
            setPasswordForm({ currentPassword: "", newPassword: "" });
        } catch (error) {
            toast.error("Failed to change password");
        }
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-xl mx-auto">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <CardDescription className="uppercase">{user.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input value={user.name} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input value={user.email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>User ID</Label>
                            <Input value={String(user.id)} disabled />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    <UserCog className="mr-2 h-4 w-4" /> Edit Profile
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input value={profileForm.email} disabled className="bg-gray-100" />
                                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleUpdateProfile}>Save Changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    <Lock className="mr-2 h-4 w-4" /> Change Password
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Change Password</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleChangePassword}>Update Password</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
