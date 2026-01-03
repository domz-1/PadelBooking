"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { adminBookingService } from "@/lib/services/admin/bookings.service"
import type { Booking } from "@/lib/schemas"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash, Calendar, Clock, MapPin, DollarSign, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function ViewBookingPage() {
    const params = useParams()
    const router = useRouter()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await adminBookingService.getById(Number(params.id))
                setBooking(response.data)
            } catch (error) {
                console.error("Failed to fetch booking", error)
                toast.error("Failed to fetch booking details")
                router.push("/admin/bookings")
            } finally {
                setLoading(false)
            }
        }
        if (params.id) {
            fetchBooking()
        }
    }, [params.id, router])

    const handleDelete = async () => {
        if (!booking) return
        try {
            await adminBookingService.deleteBooking(booking.id)
            toast.success("Booking deleted")
            router.push("/admin/bookings")
        } catch (error) {
            toast.error("Failed to delete booking")
        }
    }

    if (loading) return <div>Loading...</div>
    if (!booking) return <div>Booking not found</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/admin/bookings")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
                <div className="ml-auto flex gap-2">
                    <ConfirmDialog
                        title="Delete Booking"
                        description="Are you sure you want to delete this booking?"
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
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">Booking #{booking.id}</CardTitle>
                            <CardDescription className="mt-1">Created on {new Date().toLocaleDateString()}</CardDescription>
                        </div>
                        <Badge variant={booking.status === 'confirmed' ? "default" : "secondary"} className="capitalize">
                            {booking.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Booking Info */}
                        <div className="space-y-4">
                            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p className="font-semibold">{booking.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                                <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Time</p>
                                    <p className="font-semibold">{booking.startTime} - {booking.endTime}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                                <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Venue</p>
                                    <p className="font-semibold">{booking.Venue?.name || "Unknown Venue"}</p>
                                    <p className="text-xs text-muted-foreground">{booking.Venue?.type || "Standard"}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                                <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Price</p>
                                    <p className="font-semibold">{booking.totalPrice} USD</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                            <div className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center">
                                    <User className="h-5 w-5 mr-3 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{booking.User?.name || "Unknown"}</p>
                                        <p className="text-sm text-muted-foreground">{booking.User?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
