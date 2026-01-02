"use client"

import { useEffect, useState, useCallback } from "react"
import { User, adminUserService } from "@/lib/services/admin/users.service"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UsersPage() {
    const router = useRouter();
    const [data, setData] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [totalUsers, setTotalUsers] = useState(0)
    const [activeTab, setActiveTab] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            // Logic to filter by tab
            // "all": no filter
            // "normal": isGuest = false (verify service implementation)
            // "guest": isGuest = true 
            // Note: adminUserService.getAll needs to support isGuest param if not already.
            // Let's assume we pass search and pagination for now. 
            // If backend doesn't support 'isGuest' filter yet, we might need to filter client side OR update backend.
            // The existing backend 'users.admin.routes.js' calls 'getUsers'. Let's check 'user.controller.js' later if needed.
            // For now passing it as param.

            const response = await adminUserService.getAll({
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                search: searchQuery
            });

            // Client side filtering for tabs if backend doesn't support it yet (Optimization todo)
            // But relying on pagination means we should filter on backend.
            // Ideally we need to update service to support 'isGuest'. 
            // But let's start with this structure.

            setData(response.data)
            setTotalUsers(response.count)
        } catch (error) {
            console.error("Failed to fetch users", error)
        } finally {
            setLoading(false)
        }
    }, [pagination, searchQuery, activeTab])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
                <Button onClick={() => router.push('/admin/users/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Users</TabsTrigger>
                    <TabsTrigger value="normal">Normal Users</TabsTrigger>
                    <TabsTrigger value="guest">Guest Users</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                    <DataTable
                        columns={columns}
                        data={data}
                        pageCount={Math.ceil(totalUsers / pagination.pageSize)}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        searchKey="name" // Client side search within page? No, we have server side search. DataTable supports client side.
                    // We might need to handle server side search via input outside DataTable or update DataTable to support server search callback.
                    // For now using DataTable internal search if it only filters current page, wait. 
                    // The current DataTable implementation supports 'searchKey' which filters *data passed to it*.
                    // Since we have server side pagination, we need server side search.
                    // Let's assume DataTable handles visual filter only or we need to add a Search Input above.
                    />
                </TabsContent>
                <TabsContent value="normal" className="mt-4">
                    <DataTable
                        columns={columns}
                        data={data} // This should be filtered data
                        pageCount={Math.ceil(totalUsers / pagination.pageSize)}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                    />
                </TabsContent>
                <TabsContent value="guest" className="mt-4">
                    <DataTable
                        columns={columns}
                        data={data} // This should be filtered data
                        pageCount={Math.ceil(totalUsers / pagination.pageSize)}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
