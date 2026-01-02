"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { adminVenueService } from "@/lib/services/admin/venues.service"
import { DataForm } from "@/components/ui/data-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

const venueSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    location: z.string().min(3, "Location must be at least 3 characters"),
    pricePerHour: z.coerce.number().min(0, "Price must be positive"),
    courts: z.coerce.number().min(1, "Must have at least 1 court"),
    contactEmail: z.string().email("Invalid email"),
    contactPhone: z.string().min(5, "Phone number required"),
    description: z.string().optional(),
    amenities: z.string().optional(), // We'll handle comma separation
})

type VenueFormValues = z.infer<typeof venueSchema>

export default function NewVenuePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data: VenueFormValues) => {
        setLoading(true)
        try {
            const payload = {
                ...data,
                amenities: data.amenities ? data.amenities.split(",").map(s => s.trim()) : [],
            }
            await adminVenueService.create(payload)
            toast.success("Venue created successfully")
            router.push("/admin/venues")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create venue")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Add New Venue</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Venue Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataForm schema={venueSchema} onSubmit={onSubmit} className="space-y-4">
                        {(form) => (
                            <>
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
                                    <FormField
                                        control={form.control}
                                        name="courts"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Courts</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="4" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={loading}>
                                        {loading ? "Creating..." : "Create Venue"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </DataForm>
                </CardContent>
            </Card>
        </div>
    )
}
