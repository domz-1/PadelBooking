"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Loader2, Clock, Trash2, UserPlus, Search } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Booking, User } from "@/lib/schemas"
import { adminBookingService } from "@/lib/services/admin/bookings.service"
import { adminUserService, User as AdminUser } from "@/lib/services/admin/users.service"
import { adminVenueService } from "@/lib/services/admin/venues.service"
import { adminCategoryService, Category as CategoryType } from "@/lib/services/admin/categories.service"
import { toast } from "sonner"

const bookingFormSchema = z.object({
    date: z.date(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    status: z.enum(["pending", "confirmed", "cancelled", "completed", "no-show", "pending-coach"]),
    totalPrice: z.number().min(0),
    userId: z.number(),
    venueId: z.number(),
    categoryId: z.number().optional(),
    hasOffer: z.boolean(),
    offerValue: z.number().min(0),
})

type BookingFormValues = z.infer<typeof bookingFormSchema>

interface EditBookingDialogProps {
    booking: Booking
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditBookingDialog({
    booking,
    open,
    onOpenChange,
    onSuccess,
}: EditBookingDialogProps) {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<AdminUser[]>([])
    const [userSearch, setUserSearch] = useState("")
    const [waitlist, setWaitlist] = useState<any[]>([])
    const [waitlistSearch, setWaitlistSearch] = useState("")
    const [waitlistUsers, setWaitlistUsers] = useState<AdminUser[]>([])
    const [selectedWaitlistUser, setSelectedWaitlistUser] = useState<string | null>(null)
    const [venues, setVenues] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            date: new Date(booking.date + 'T12:00:00'),
            startTime: booking.startTime.substring(0, 5),
            endTime: booking.endTime.substring(0, 5),
            status: booking.status as any,
            totalPrice: Number(booking.totalPrice),
            userId: Number(booking.userId),
            venueId: Number(booking.venueId),
            categoryId: booking.categoryId ? Number(booking.categoryId) : undefined,
            hasOffer: !!booking.hasOffer,
            offerValue: Number(booking.offerValue || 0),
        },
    })

    const hasOffer = form.watch("hasOffer")

    const fetchWaitlist = async () => {
        try {
            const res = await adminBookingService.getWaitlistForSlot({
                venueId: Number(booking.venueId),
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime
            })
            setWaitlist(res.data)
        } catch (error) {
            console.error("Failed to fetch waitlist", error)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, venuesRes, categoriesRes] = await Promise.all([
                    adminUserService.getAll({ limit: 50, search: userSearch }),
                    adminVenueService.getAll({ limit: 100 }),
                    adminCategoryService.getAll()
                ])
                await fetchWaitlist()

                const userMap = new Map();
                usersRes.data.forEach((u: any) => {
                    if (u && u.id !== undefined && u.id !== null) {
                        userMap.set(Number(u.id), u);
                    }
                });

                if (booking.User && booking.User.id !== undefined && booking.User.id !== null) {
                    userMap.set(Number(booking.User.id), booking.User);
                }

                setUsers(Array.from(userMap.values()));
                setVenues(venuesRes?.data || []);
                setCategories(categoriesRes?.data || []);
            } catch (error) {
                console.error("Failed to fetch main data", error)
            }
        }
        if (open) {
            fetchData()
        }
    }, [open, userSearch, booking.id])

    useEffect(() => {
        const fetchWaitlistSearch = async () => {
            if (waitlistSearch.length > 1) {
                try {
                    const res = await adminUserService.getAll({ limit: 10, search: waitlistSearch })
                    setWaitlistUsers(res.data as any)
                } catch (error) {
                    console.error("Failed to search waitlist users", error)
                }
            }
        }
        fetchWaitlistSearch()
    }, [waitlistSearch])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this booking?")) return
        setLoading(true)
        try {
            await adminBookingService.deleteBooking(booking.id as number)
            toast.success("Booking deleted")
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete booking")
        } finally {
            setLoading(false)
        }
    }

    const onAddWaitlist = async () => {
        if (!selectedWaitlistUser) return
        setLoading(true)
        try {
            await adminBookingService.joinWaitlist({
                userId: Number(selectedWaitlistUser),
                venueId: Number(booking.venueId),
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime
            })
            toast.success("User added to waitlist")
            setSelectedWaitlistUser(null)
            setWaitlistSearch("")
            fetchWaitlist()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add user to waitlist")
        } finally {
            setLoading(false)
        }
    }

    const onDeleteWaitlistEntry = async (id: number) => {
        if (!confirm("Remove user from waitlist?")) return
        try {
            await adminBookingService.deleteWaitlistEntry(id)
            toast.success("User removed from waitlist")
            fetchWaitlist()
        } catch (error: any) {
            toast.error("Failed to remove user")
        }
    }

    async function onSubmit(values: BookingFormValues) {
        if (!booking.id) return
        setLoading(true)
        try {
            const formattedData = {
                ...values,
                date: format(values.date, "yyyy-MM-dd"),
                categoryId: values.categoryId || null
            }
            await adminBookingService.update(booking.id as number, formattedData as any)
            toast.success("Booking updated successfully")
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update booking")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Management: Booking #{booking.id}</DialogTitle>
                    <DialogDescription>
                        Manage details, status, and waitlist.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="info">Information</TabsTrigger>
                        <TabsTrigger value="waitlist">Waitlist ({waitlist.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-4 py-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value instanceof Date ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
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
                                                value={String(field.value)}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select customer" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <div className="flex items-center px-3 pb-2 pt-1">
                                                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                        <Input
                                                            placeholder="Search users..."
                                                            value={userSearch}
                                                            onChange={(e) => setUserSearch(e.target.value)}
                                                            className="h-8 border-none focus-visible:ring-0 p-0"
                                                        />
                                                    </div>
                                                    {users.map((u) => (
                                                        <SelectItem key={`user-${u.id}`} value={String(u.id)}>
                                                            <div className="flex flex-col">
                                                                <span>{u.name}</span>
                                                                <span className="text-[10px] text-muted-foreground">{u.email}</span>
                                                            </div>
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
                                        name="startTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Time</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Time</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select
                                                    onValueChange={(val) => field.onChange(val !== "none" ? Number(val) : undefined)}
                                                    value={field.value ? String(field.value) : "none"}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">Standard / None</SelectItem>
                                                        {categories.map((c) => (
                                                            <SelectItem key={c.id} value={String(c.id)}>
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="w-2 h-2 rounded-full"
                                                                        style={{ backgroundColor: c.color }}
                                                                    />
                                                                    {c.name}
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
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="no-show">No Show</SelectItem>
                                                        <SelectItem value="pending-coach">Pending Coach</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="totalPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Price (USD)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
                                    <FormField
                                        control={form.control}
                                        name="hasOffer"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Special Offer</FormLabel>
                                                    <div className="text-[10px] text-muted-foreground">Apply custom discount</div>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    {hasOffer && (
                                        <FormField
                                            control={form.control}
                                            name="offerValue"
                                            render={({ field }) => (
                                                <FormItem className="animate-in fade-in slide-in-from-top-2">
                                                    <FormLabel>Offer Amount (USD)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                <DialogFooter className="flex flex-row justify-between pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading} size="sm">
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="waitlist" className="py-4 space-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Add User to Waitlist
                                </label>
                                <div className="flex gap-2">
                                    <Select
                                        onValueChange={setSelectedWaitlistUser}
                                        value={selectedWaitlistUser || undefined}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Search user to add..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="flex items-center px-3 pb-2 pt-1 border-b">
                                                <Search className="mr-2 h-4 w-4 opacity-50" />
                                                <Input
                                                    placeholder="Type name or email..."
                                                    value={waitlistSearch}
                                                    onChange={(e) => setWaitlistSearch(e.target.value)}
                                                    className="h-8 border-none focus-visible:ring-0 p-0"
                                                />
                                            </div>
                                            {waitlistUsers.map((u) => (
                                                <SelectItem key={u.id} value={String(u.id)}>
                                                    <div className="flex flex-col">
                                                        <span>{u.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">{u.email}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {waitlistUsers.length === 0 && waitlistSearch.length > 1 && (
                                                <div className="p-4 text-center text-xs text-muted-foreground">
                                                    No matches found
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        size="icon"
                                        onClick={onAddWaitlist}
                                        disabled={loading || !selectedWaitlistUser}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card">
                                <div className="p-3 border-b bg-muted/30">
                                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-primary" />
                                        Waitlist Queue
                                    </h4>
                                </div>
                                <div className="divide-y max-h-[250px] overflow-auto">
                                    {waitlist.length === 0 ? (
                                        <div className="p-8 text-center text-sm text-muted-foreground italic">
                                            No users in waitlist
                                        </div>
                                    ) : (
                                        waitlist.map((entry, idx) => (
                                            <div key={entry.id || `wait-${idx}`} className="flex items-center justify-between p-3 group hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{entry.User?.name}</div>
                                                        <div className="text-[10px] text-muted-foreground">{entry.User?.email}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => onDeleteWaitlistEntry(entry.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
