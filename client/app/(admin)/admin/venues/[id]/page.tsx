"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Venue, adminVenueService } from "@/lib/services/admin/venues.service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash, MapPin, Phone, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function ViewVenuePage() {
    const params = useParams()
    const router = useRouter()
    const [venue, setVenue] = useState<Venue | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchVenue = async () => {
            try {
                const response = await adminVenueService.getById(Number(params.id))
                setVenue(response.data)
            } catch (error) {
                console.error("Failed to fetch venue", error)
                toast.error("Failed to fetch venue details")
            } finally {
                setLoading(false)
            }
        }
        if (params.id) {
            fetchVenue()
        }
    }, [params.id])

    const handleDelete = async () => {
        if (!venue) return
        try {
            await adminVenueService.delete(venue.id)
            toast.success("Venue deleted")
            router.push("/admin/venues")
        } catch (error) {
            toast.error("Failed to delete venue")
        }
    }

    if (loading) return <div>Loading...</div>
    if (!venue) return <div>Venue not found</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/admin/venues")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Venue Details</h1>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/admin/venues/${venue.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <ConfirmDialog
                        title="Delete Venue"
                        description="Are you sure you want to delete this venue?"
                        onConfirm={handleDelete}
                    >
                        <Button variant="destructive">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </ConfirmDialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{venue.name}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                        <MapPin className="mr-1 h-4 w-4" /> {venue.location}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Price/Hour</p>
                            <p className="text-2xl font-bold">{venue.pricePerHour} USD</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Courts</p>
                            <p className="text-2xl font-bold">{venue.courts}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{venue.contactEmail}</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{venue.contactPhone}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                            <div className="flex flex-wrap gap-2">
                                {venue.amenities && venue.amenities.length > 0 ? (
                                    venue.amenities.map((amenity, index) => (
                                        <Badge key={index} variant="secondary">{amenity}</Badge>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">No amenities listed</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {venue.description && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-muted-foreground">{venue.description}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
