"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { adminVenueService } from "@/lib/services/admin/venues.service"
import { adminBranchService } from "@/lib/services/admin/branches.service"
import type { Branch, Venue } from "@/lib/schemas"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

// Helper for time options
const timeOptions = Array.from({ length: 24 }).map((_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: `${hour}:00` };
});
// Add end of day option
timeOptions.push({ value: "23:59", label: "23:59" });
timeOptions.push({ value: "24:00", label: "24:00" }); // Server handles this

const venueSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    location: z.string().min(3, "Location must be at least 3 characters"),
    pricePerHour: z.coerce.number().min(0, "Price must be positive"),

    contactEmail: z.string().email("Invalid email"),
    contactPhone: z.string().min(5, "Phone number required"),
    description: z.string().optional(),
    amenities: z.string().optional(),
    branchId: z.string().optional(), // Select value returns string usually, we'll coerce on submit
    order: z.coerce.number().optional().default(0),
    blockedPeriods: z.array(z.object({
        days: z.array(z.number()),
        startTime: z.string(),
        endTime: z.string()
    })).optional().default([]),
})

type VenueFormValues = z.infer<typeof venueSchema>

interface VenueFormProps {
    initialData?: Venue
    isEditing?: boolean
}

export function VenueForm({ initialData, isEditing = false }: VenueFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [branches, setBranches] = useState<Branch[]>([])

    // Local state for the new rule builder
    const [newRule, setNewRule] = useState<{ days: number[], startTime: string, endTime: string }>({
        days: [],
        startTime: "",
        endTime: ""
    })

    const addBlockedPeriod = () => {
        if (newRule.days.length === 0 || !newRule.startTime || !newRule.endTime) return;

        const current = form.getValues("blockedPeriods") || [];
        form.setValue("blockedPeriods", [...current, { ...newRule }]);
        setNewRule({ days: [], startTime: "", endTime: "" });
    };

    // Fetch Branches
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const branches = await adminBranchService.getAll()
                setBranches(branches || [])
            } catch (error) {
                console.error("Failed to fetch branches", error)
            }
        }
        fetchBranches()
    }, [])

    const form = useForm<VenueFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(venueSchema) as any,
        defaultValues: initialData ? {
            ...initialData,
            amenities: initialData.amenities ? (Array.isArray(initialData.amenities) ? initialData.amenities.join(", ") : String(initialData.amenities)) : "",
            branchId: initialData.branchId ? String(initialData.branchId) : undefined,
            blockedPeriods: (initialData as any).blockedPeriods || [],
        } : {
            name: "",
            location: "",
            pricePerHour: 50,

            contactEmail: "",
            contactPhone: "",
            description: "",
            amenities: "",
            order: 0,
            blockedPeriods: [],
        },
    })

    async function onSubmit(data: VenueFormValues) {
        setLoading(true)
        try {
            const payload = {
                ...data,
                amenities: data.amenities ? data.amenities.split(",").map(s => s.trim()) : [],
                branchId: data.branchId ? Number(data.branchId) : null,
            }

            if (isEditing && initialData?.id) {
                await adminVenueService.update(initialData.id, payload)
                toast.success("Venue updated successfully")
            } else {
                await adminVenueService.create(payload)
                toast.success("Venue created successfully")
            }
            router.push("/admin/venues")
            router.refresh()
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any
            toast.error(err.response?.data?.message || (isEditing ? "Failed to update venue" : "Failed to create venue"))
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Padel Center" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="branchId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Branch</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a branch" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {branches.map(branch => (
                                            <SelectItem key={branch.id} value={String(branch.id)}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Assign this venue to a branch.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Sport St, City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="pricePerHour"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price / Hour</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="50" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="contact@venue.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="+123456789" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe the venue..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amenities (comma separated)</FormLabel>
                            <FormControl>
                                <Input placeholder="Wifi, Parking, Showers" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormDescription>Lower numbers appear first.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Blocked Periods Section */}
                <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Blocked schedules (Recurring)</Label>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-background">
                            <div className="space-y-3">
                                <Label>Days</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                                        <div key={day} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`day-${i}`}
                                                checked={newRule.days.includes(i)}
                                                onCheckedChange={(checked) => {
                                                    const days = checked
                                                        ? [...newRule.days, i]
                                                        : newRule.days.filter(d => d !== i);
                                                    setNewRule({ ...newRule, days });
                                                }}
                                            />
                                            <label htmlFor={`day-${i}`} className="text-sm cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{day}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Select
                                    value={newRule.startTime}
                                    onValueChange={(val) => setNewRule({ ...newRule, startTime: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select start time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeOptions.map(opt => (
                                            <SelectItem key={`start-${opt.value}`} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Select
                                            value={newRule.endTime}
                                            onValueChange={(val) => setNewRule({ ...newRule, endTime: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select end time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeOptions.map(opt => (
                                                    <SelectItem key={`end-${opt.value}`} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="button"
                                        size="icon"
                                        onClick={addBlockedPeriod}
                                        disabled={!newRule.startTime || !newRule.endTime || newRule.days.length === 0}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* List of active rules */}
                        <div className="space-y-2">
                            {form.watch("blockedPeriods")?.map((rule, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border rounded-md bg-card">
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-1">
                                            {rule.days.sort().map(d => (
                                                <Badge key={d} variant="outline" className="text-xs">
                                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="text-sm font-medium">
                                            {rule.startTime} - {rule.endTime}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            const current = form.getValues("blockedPeriods") || [];
                                            form.setValue("blockedPeriods", current.filter((_, i) => i !== idx));
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {(!form.watch("blockedPeriods")?.length) && (
                                <p className="text-sm text-muted-foreground text-center py-2">No blocked periods defined.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : isEditing ? "Update Venue" : "Create Venue"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
