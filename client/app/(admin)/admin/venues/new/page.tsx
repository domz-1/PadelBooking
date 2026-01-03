"use client"

import { VenueForm } from "@/components/admin/venues/VenueForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NewVenuePage() {
    const router = useRouter()

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
                    <VenueForm />
                </CardContent>
            </Card>
        </div>
    )
}
