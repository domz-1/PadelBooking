"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, addHours, parse } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { adminBookingService } from "@/lib/services/admin/bookings.service"
import { adminUserService } from "@/lib/services/admin/users.service"
import { adminBookingStatusService, BookingStatus } from "@/lib/services/admin/bookingStatus.service"
import { adminVenueService } from "@/lib/services/admin/venues.service"
import { User } from "@/lib/schemas"

const bookingFormSchema = z.object({
    userId: z.number({ message: "User is required" }),
    statusId: z.number().optional(),
    venueId: z.number({ message: "Venue is required" }),
    duration: z.string(),
    totalPrice: z.number().min(0),
    status: z.string(),
    type: z.enum(['standard', 'academy']).default('standard')
})

type BookingFormValues = z.infer<typeof bookingFormSchema>

interface AdminCreateBookingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    venueId: number
    venueName: string
    date: string
    startTime: string
    onSuccess?: () => void
}

export function AdminCreateBookingDialog({
    open,
    onOpenChange,
    venueId,
    venueName,
    date,
    startTime,
    onSuccess
}: AdminCreateBookingDialogProps) {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [statuses, setStatuses] = useState<BookingStatus[]>([])
    const [userSearch, setUserSearch] = useState("")

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            duration: "1",
            totalPrice: 0,
            status: "confirmed",
            venueId: venueId,
            type: "standard"
        }
    })

    const [venues, setVenues] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, categoriesRes, venuesRes] = await Promise.all([
                    adminUserService.getAll({ limit: 50, search: userSearch }),
                    adminBookingStatusService.getAll(),
                    adminVenueService.getAll({ limit: 100 })
                ])
                const userMap = new Map();
                usersRes.data.forEach((u: any) => {
                    if (u && u.id !== undefined && u.id !== null) {
                        userMap.set(Number(u.id), u);
                    }
                });
                setUsers(Array.from(userMap.values()));
                setCategories(categoriesRes.data)
                setVenues(venuesRes.data)
            } catch (error) {
                console.error("Failed to fetch grid creation data", error)
            }
        }
        if (open) {
            fetchData()
        }
    }, [open, userSearch])

    async function onSubmit(values: BookingFormValues) {
        setLoading(true)
        try {
            const startStr = `${date}T${startTime}`
            const startDate = parse(startStr, "yyyy-MM-dd'T'HH:mm", new Date())
            const endDate = addHours(startDate, Number(values.duration))
            const endTimeStr = format(endDate, "HH:mm")

            await adminBookingService.create({
                userId: values.userId,
                venueId: values.venueId,
                date,
                startTime: startTime.substring(0, 5),
                endTime: endTimeStr,
                statusId: values.statusId,
                totalPrice: values.totalPrice,
                status: values.status as any,
                type: values.type
            })

            toast.success("Booking created successfully")
            onOpenChange(false)
            form.reset()
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create booking")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Booking for {venueName}</DialogTitle>
                    <div className="text-sm text-muted-foreground">
                        {format(new Date(date), "PPP")} at {startTime}
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="venueId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Venue (Court)</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={String(field.value)}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select venue" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {venues.map((v) => (
                                                <SelectItem key={v.id} value={String(v.id)}>
                                                    {v.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer</FormLabel>
                                    <Select
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        value={field.value ? String(field.value) : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select user" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <div className="flex items-center px-3 pb-2 pt-1">
                                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                <Input
                                                    placeholder="Search user..."
                                                    className="h-8 w-full bg-transparent p-0 focus-visible:ring-0"
                                                    value={userSearch}
                                                    onChange={(e) => setUserSearch(e.target.value)}
                                                />
                                            </div>
                                            {users.map((user) => (
                                                <SelectItem key={`create-user-${user.id}`} value={String(user.id)}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select duration" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">1 Hour</SelectItem>
                                                <SelectItem value="1.5">1.5 Hours</SelectItem>
                                                <SelectItem value="2">2 Hours</SelectItem>
                                                <SelectItem value="3">3 Hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="statusId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={(v) => field.onChange(v === "none" ? undefined : Number(v))}
                                            value={field.value ? String(field.value) : "none"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">Standard / None</SelectItem>
                                                {statuses.map((status) => (
                                                    <SelectItem key={status.id} value={String(status.id)}>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: status.color }}
                                                            />
                                                            {status.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="totalPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Price (EGP)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Booking Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="standard">Standard</SelectItem>
                                                <SelectItem value="academy">Academy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Booking
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
