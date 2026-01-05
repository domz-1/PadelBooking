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
        } : {
            name: "",
            location: "",
            pricePerHour: 50,

            contactEmail: "",
            contactPhone: "",
            description: "",
            amenities: "",
            order: 0,
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
