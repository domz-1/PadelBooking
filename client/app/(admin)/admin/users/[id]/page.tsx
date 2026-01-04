"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { User, adminUserService } from "@/lib/services/admin/users.service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash, Ban, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { columns } from "@/app/(admin)/admin/bookings/columns"
import { DataTable } from "@/components/ui/data-table"
import { adminBookingService } from "@/lib/services/admin/bookings.service"

export default function ViewUserPage() {
    const params = useParams()
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await adminUserService.getById(Number(params.id))
                setUser(response.data)
            } catch (error) {
                console.error("Failed to fetch user", error)
                toast.error("Failed to fetch user details")
            } finally {
                setLoading(false)
            }
        }
        if (params.id) {
            fetchUser()
        }
    }, [params.id])

    const handleDelete = async () => {
        if (!user) return
        try {
            await adminUserService.deleteUser(user.id)
            toast.success("User deleted")
            router.push("/admin/users")
        } catch (error) {
            toast.error("Failed to delete user")
        }
    }

    const handleBan = async () => {
        if (!user) return
        try {
            await adminUserService.banUser(user.id)
            setUser({ ...user, isActive: !user.isActive })
            toast.success(user.isActive ? "User banned" : "User activated")
        } catch (error) {
            toast.error("Failed to update user status")
        }
    }

    if (loading) return <div>Loading...</div>
    if (!user) return <div>User not found</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/admin/users/${user.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <ConfirmDialog
                        title={user.isActive ? "Ban User" : "Activate User"}
                        description={`Are you sure you want to ${user.isActive ? 'ban' : 'activate'} this user?`}
                        onConfirm={handleBan}
                    >
                        <Button
                            variant={user.isActive ? "destructive" : "default"}
                            className={!user.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                            {user.isActive ? <Ban className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            {user.isActive ? "Ban User" : "Activate User"}
                        </Button>
                    </ConfirmDialog>

                    <ConfirmDialog
                        title="Delete User"
                        description="Are you sure you want to delete this user? This action cannot be undone."
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
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">ID</p>
                            <p>{user.id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive ? "Active" : "Banned"}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Joined</p>
                            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        {user.phone && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                <p>{user.phone}</p>
                            </div>
                        )}
                        {user.bio && (
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Bio</p>
                                <p className="text-sm">{user.bio}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {user.image && (
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-32 h-32 rounded-full overflow-hidden border">
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">User Bookings</h2>
                <BookingsTable userId={user.id} />
            </div>
        </div>
    )
}

function BookingsTable({ userId }: { userId: number }) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    })
    const [totalBookings, setTotalBookings] = useState(0)

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const response = await adminBookingService.getAll({
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                userId: userId
            });
            setData(response.data)
            setTotalBookings(response.count)
        } catch (error) {
            console.error("Failed to fetch user bookings", error)
            toast.error("Failed to fetch user bookings")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [userId, pagination])

    const userColumns = columns(fetchBookings).filter((col: any) => col.id !== "user");

    if (loading) return <div>Loading bookings...</div>

    return (
        <DataTable
            columns={userColumns}
            data={data}
            pageCount={Math.ceil(totalBookings / pagination.pageSize)}
            pagination={pagination}
            onPaginationChange={setPagination}
        />
    )
}
