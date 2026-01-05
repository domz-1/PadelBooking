"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Loader2, Clock, Trash2, UserPlus, Search, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { TimePicker } from "@/components/ui/time-picker"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Booking } from "@/lib/schemas"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

import { useBookingData } from "@/hooks/useBookingData"
import { useBookingOperations } from "@/hooks/useBookingOperations"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { VenueSelectField } from "./fields/VenueSelectField"
import { UserSelectField } from "./fields/UserSelectField"
import { StatusFields } from "./fields/StatusFields"
import { PriceOfferFields } from "./fields/PriceOfferFields"
import { BookingTypeField } from "./fields/BookingTypeField"

import { adminUserService } from "@/lib/services/admin/users.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const bookingFormSchema = z.object({
    date: z.date(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    totalPrice: z.number().min(0),
    userId: z.number(),
    venueId: z.number(),
    statusId: z.number().optional(),
    type: z.enum(['standard', 'academy']),
    hasOffer: z.boolean(),
    offerValue: z.number().min(0),
    notes: z.string().optional(),
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
    const [userSearch, setUserSearch] = useState("")
    const { users, venues, statuses } = useBookingData(open, userSearch)
    const {
        loading,
        updateBooking,
        deleteBooking,
        waitlist,
        fetchWaitlist,
        joinWaitlist,
        deleteWaitlistEntry
    } = useBookingOperations()

    const [waitlistSearch, setWaitlistSearch] = useState("")
    const [waitlistUsers, setWaitlistUsers] = useState<any[]>([])
    const [selectedWaitlistUser, setSelectedWaitlistUser] = useState<string | null>(null)
    const [seriesOption, setSeriesOption] = useState<'single' | 'upcoming'>('single')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            date: new Date(booking.date + 'T12:00:00'),
            startTime: booking.startTime.substring(0, 5),
            endTime: booking.endTime.substring(0, 5),
            totalPrice: Number(booking.totalPrice),
            userId: Number(booking.userId),
            venueId: Number(booking.venueId),
            statusId: booking.statusId ? Number(booking.statusId) : undefined,
            type: (booking.type as any) || "standard",
            hasOffer: !!booking.hasOffer,
            offerValue: Number(booking.offerValue || 0),
            notes: booking.notes || '',
        },
    })

    useEffect(() => {
        if (open && booking.venueId && booking.date && booking.startTime && booking.endTime) {
            fetchWaitlist({
                venueId: Number(booking.venueId),
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime
            })
        }
    }, [open, booking.id, booking.venueId, booking.date, booking.startTime, booking.endTime, fetchWaitlist])

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

    async function onSubmit(values: BookingFormValues) {
        if (!booking.id) return
        const formattedData = {
            ...values,
            date: format(values.date, "yyyy-MM-dd"),
            statusId: values.statusId || undefined,
            seriesOption: booking.recurrenceId ? seriesOption : 'single'
        }
        await updateBooking(booking.id as number, formattedData, () => {
            onOpenChange(false)
            onSuccess?.()
        })
    }

    const handleDelete = async () => {
        if (!booking.id) return
        await deleteBooking(booking.id as number, booking.recurrenceId ? seriesOption : 'single', () => {
            onOpenChange(false)
            onSuccess?.()
        })
    }

    const onAddWaitlist = async () => {
        if (!selectedWaitlistUser) return
        await joinWaitlist({
            userId: Number(selectedWaitlistUser),
            venueId: Number(booking.venueId),
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime
        }, () => {
            setSelectedWaitlistUser(null)
            setWaitlistSearch("")
            fetchWaitlist({
                venueId: Number(booking.venueId),
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime
            })
        })
    }

    const formatPhoneForWhatsApp = (phone: string | undefined) => {
        if (!phone) return ""
        return phone.replace(/\D/g, "")
    }

    const handleWhatsAppChat = () => {
        const phone = formatPhoneForWhatsApp(booking.User?.phone)
        if (phone) {
            window.open(`https://wa.me/${phone}`, "_blank")
        } else {
            toast.info("No phone number available for WhatsApp")
        }
    }

    const getStatusStyles = (statusId: number | undefined) => {
        const status = statuses.find(s => s.id === statusId)
        if (!status) {
            // Default styles for "no status"
            return { dot: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', name: 'No Status' }
        }
        return {
            dot: '', // Will use custom style
            color: status.color,
            bg: 'bg-opacity-10',
            text: '', // Will use custom style
            name: status.name
        }
    }

    const currentStatusId = form.watch('statusId')
    const currentStatus = statuses.find(s => s.id === currentStatusId) || booking.BookingStatus

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DialogTitle>Management: Booking #{booking.id}</DialogTitle>
                            {currentStatus && (
                                <div
                                    className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border"
                                    style={{
                                        backgroundColor: `${currentStatus.color}15`,
                                        color: currentStatus.color,
                                        borderColor: `${currentStatus.color}30`
                                    }}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                                        style={{ backgroundColor: currentStatus.color }}
                                    />
                                    {currentStatus.name}
                                </div>
                            )}
                        </div>
                    </div>
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

                                <UserSelectField
                                    form={form}
                                    users={users}
                                    setUserSearch={setUserSearch}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Time</FormLabel>
                                                <FormControl>
                                                    <TimePicker
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
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
                                                    <TimePicker
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <VenueSelectField form={form} venues={venues} />
                                    <BookingTypeField form={form} />
                                </div>

                                <StatusFields form={form} statuses={statuses} />
                                <PriceOfferFields form={form} />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add any special notes or instructions..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {booking.recurrenceId && (
                                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-primary">
                                            <RefreshCw className="w-4 h-4" />
                                            Update Options
                                        </div>
                                        <RadioGroup
                                            value={seriesOption}
                                            onValueChange={(v: any) => setSeriesOption(v)}
                                            className="grid grid-cols-1 gap-2"
                                        >
                                            <div className="flex items-center space-x-2 bg-background p-2 rounded border cursor-pointer hover:bg-accent/50">
                                                <RadioGroupItem value="single" id="single" />
                                                <Label htmlFor="single" className="flex-1 cursor-pointer">This booking only</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-background p-2 rounded border cursor-pointer hover:bg-accent/50">
                                                <RadioGroupItem value="upcoming" id="upcoming" />
                                                <Label htmlFor="upcoming" className="flex-1 cursor-pointer">This and all upcoming bookings</Label>
                                            </div>
                                        </RadioGroup>
                                        <p className="text-[10px] text-muted-foreground mt-2 px-1">
                                            Note: "Upcoming" will apply changes to all future instances in this series.
                                        </p>
                                    </div>
                                )}

                                <DialogFooter className="flex flex-row justify-between pt-4 border-t gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={loading}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                        Delete
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading} size="sm">
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {booking.recurrenceId && seriesOption === 'upcoming' ? "Save Series" : "Save Changes"}
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="waitlist" className="py-4 space-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium leading-none">
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
                                {waitlist.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground italic">
                                        No users in waitlist
                                    </div>
                                ) : (
                                    <div className="bg-muted/20 border rounded-xl overflow-hidden divide-y">
                                        {waitlist.map((entry, idx) => (
                                            <div key={entry.id || `wait-${idx}`} className="flex items-center justify-between p-2.5 px-4 hover:bg-muted/40 transition-colors">
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
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => deleteWaitlistEntry(entry.id, () => {
                                                        fetchWaitlist({
                                                            venueId: Number(booking.venueId),
                                                            date: booking.date,
                                                            startTime: booking.startTime,
                                                            endTime: booking.endTime
                                                        })
                                                    })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Delete Booking"
                description={booking.recurrenceId && seriesOption === "upcoming"
                    ? "Are you sure you want to delete this AND ALL UPCOMING bookings in this series? This action cannot be undone."
                    : "Are you sure you want to permanently delete this booking? This action cannot be undone."
                }
                onConfirm={handleDelete}
                variant="destructive"
            />
        </Dialog>
    )
}
