"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { adminVenueService } from "@/lib/services/admin/venues.service"
import { VenueForm } from "@/components/admin/venues/VenueForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function EditVenuePage() {
    const router = useRouter()
    const params = useParams()
    const [initialData, setInitialData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchVenue = async () => {
            try {
                const response = await adminVenueService.getById(Number(params.id))
                setInitialData(response.data)
            } catch (error) {
                toast.error("Failed to load venue")
                router.push("/admin/venues")
            } finally {
                setLoading(false)
            }
        }
        if (params.id) {
            fetchVenue()
        }
    }, [params.id, router])

    if (loading) return <div>Loading...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Venue</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Venue Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <VenueForm initialData={initialData} isEditing />
                </CardContent>
            </Card>
        </div>
    )
}
