"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { adminUserService } from "@/lib/services/admin/users.service";
import { toast } from "sonner";

const userFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Phone must be at least 10 characters"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface QuickCreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultPhone?: string;
    onSuccess: (user: { id: number; name: string; email: string; phone?: string }) => void;
}

export function QuickCreateUserDialog({
    open,
    onOpenChange,
    defaultPhone = "",
    onSuccess,
}: QuickCreateUserDialogProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: "",
            phone: defaultPhone,
        },
    });

    // Reset form with new defaultPhone whenever the dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                name: "",
                phone: defaultPhone,
            });
        }
    }, [open, defaultPhone, form]);

    async function onSubmit(values: UserFormValues) {

        setLoading(true);
        try {
            // Clean phone number (only digits)
            const cleanPhone = values.phone.replace(/\D/g, "");

            const payload = {
                name: values.name,
                phone: values.phone,
                email: `${cleanPhone}@padelpoint.com`,
                password: "password123",
                role: "user" as const,
            };

            const response = await adminUserService.createUser(payload);

            if (response.success) {
                toast.success("User created successfully");
                onSuccess(response.data);
                onOpenChange(false);
                form.reset();
            } else {
                toast.error("Failed to create user");
            }
        } catch (error: unknown) {
            console.error("Create user error:", error);
            const errorMessage = error instanceof Error ? error.message :
                (typeof error === 'object' && error && 'response' in error) ?
                (error as any).response?.data?.message : "Error creating user";
            toast.error(errorMessage || "Error creating user");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[400px]"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Quick Create User</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter user name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create & Select User
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
