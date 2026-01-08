"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Pencil, Trash2, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { adminBookingStatusService, BookingStatus } from "@/lib/services/admin/bookingStatus.service"

const bookingStatusFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color code"),
    description: z.string().optional(),
})

type BookingStatusFormValues = z.infer<typeof bookingStatusFormSchema>

export function BookingStatusManagement() {
    const [statuses, setStatuses] = useState<BookingStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [currentStatus, setCurrentStatus] = useState<BookingStatus | null>(null)

    const form = useForm<BookingStatusFormValues>({
        resolver: zodResolver(bookingStatusFormSchema),
        defaultValues: {
            name: "",
            color: "#000000",
            description: ""
        }
    })

    const fetchStatuses = async () => {
        try {
            setLoading(true)
            const response = await adminBookingStatusService.getAll()
            setStatuses(response.data)
        } catch (error) {
            console.error("Failed to fetch booking statuses", error)
            toast.error("Failed to fetch booking statuses")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatuses()
    }, [])

    const handleEdit = (status: BookingStatus) => {
        setCurrentStatus(status)
        form.reset({
            name: status.name,
            color: status.color,
            description: status.description || ""
        })
        setEditDialogOpen(true)
    }

    const handleDelete = (status: BookingStatus) => {
        setCurrentStatus(status)
        setDeleteDialogOpen(true)
    }

    const handleCreate = () => {
        setCurrentStatus(null)
        form.reset({
            name: "",
            color: "#000000",
            description: ""
        })
        setEditDialogOpen(true)
    }

    const onSubmit = async (values: BookingStatusFormValues) => {
        try {
            if (currentStatus) {
                // Update existing status
                await adminBookingStatusService.update(currentStatus.id, values)
                toast.success("Booking status updated successfully")
            } else {
                // Create new status
                await adminBookingStatusService.create(values)
                toast.success("Booking status created successfully")
            }
            fetchStatuses()
            setEditDialogOpen(false)
        } catch (error) {
            console.error("Failed to save booking status", error)
            toast.error("Failed to save booking status")
        }
    }

    const onDeleteConfirm = async () => {
        if (!currentStatus) return
        try {
            await adminBookingStatusService.delete(currentStatus.id)
            toast.success("Booking status deleted successfully")
            fetchStatuses()
            setDeleteDialogOpen(false)
        } catch (error) {
            console.error("Failed to delete booking status", error)
            toast.error("Failed to delete booking status")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold opacity-0">Booking Statuses</h2>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Status
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statuses.map((status) => (
                        <div key={status.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: status.color }}
                                    />
                                    <h3 className="font-semibold">{status.name}</h3>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleEdit(status)}
                                    >
                                        <Pencil className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDelete(status)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                            {status.description && (
                                <p className="text-sm text-muted-foreground mb-3">{status.description}</p>
                            )}
                            <div className="text-xs text-muted-foreground">
                                <span>Color: {status.color}</span>
                                {status.isDefault && (
                                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Default</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit/Create Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{currentStatus ? 'Edit' : 'Create'} Booking Status</DialogTitle>
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
                                            <Input placeholder="e.g., Confirmed, Pending" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2 items-center">
                                                <Input type="color" className="w-12 h-10 p-1" {...field} />
                                                <Input placeholder="#000000" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe when this status is used" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    {currentStatus ? 'Update' : 'Create'} Status
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Booking Status</DialogTitle>
                    </DialogHeader>
                    <p className="py-4">
                        Are you sure you want to delete the status <strong>{currentStatus?.name}</strong>?
                        This action cannot be undone and may affect existing bookings.
                    </p>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={onDeleteConfirm}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}