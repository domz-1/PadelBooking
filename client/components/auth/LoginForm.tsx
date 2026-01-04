
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoginSchema, type LoginCredentials } from "@/lib/schemas";
import api from "@/lib/api";
import { useAuthStore } from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useBranding } from "@/components/providers/BrandingProvider";

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuthStore();
    const { brandName, logo } = useBranding();

    const form = useForm<LoginCredentials>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: LoginCredentials) {
        setIsLoading(true);
        try {
            const response = await api.post("/auth/login", data);
            if (response.data.success) {
                toast.success("Logged in successfully");
                const token = response.data.token;
                const meResponse = await api.get("/auth/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (meResponse.data.success) {
                    login(token, meResponse.data.data);
                    router.push("/bookings");
                } else {
                    toast.error("Could not fetch user profile");
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6 w-full max-w-md">
            <div className="flex flex-col items-center gap-2">
                {logo ? (
                    <img src={logo} alt={brandName} className="h-12 w-auto mb-2" />
                ) : (
                    <h1 className="text-3xl font-bold text-primary">{brandName}</h1>
                )}
                <p className="text-sm text-gray-500">Welcome back! Please login to your account.</p>
            </div>
            <Card className="w-full mx-auto">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="text-brand-600 hover:underline">
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
