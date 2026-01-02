"use client"

import { useEffect, useState } from "react"
import { Venue, adminVenueService } from "@/lib/services/admin/venues.service"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VenuesPage() {
    const router = useRouter()
    const [data, setData] = useState<Venue[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [totalVenues, setTotalVenues] = useState(0)

    useEffect(() => {
        const fetchVenues = async () => {
            setLoading(true)
            try {
                const response = await adminVenueService.getAll({
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize
                });
                setData(response.data)
                setTotalVenues(response.count)
            } catch (error) {
                console.error("Failed to fetch venues", error)
            } finally {
                setLoading(false)
            }
        }

        fetchVenues()
    }, [pagination])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Venues Management</h1>
                <Button onClick={() => router.push('/admin/venues/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Add Venue
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={data}
                pageCount={Math.ceil(totalVenues / pagination.pageSize)}
                pagination={pagination}
                onPaginationChange={setPagination}
            />
        </div>
    )
}
