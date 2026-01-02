"use client"

import { useEffect, useState } from "react"
import { Offer, adminOfferService } from "@/lib/services/admin/offers.service"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OffersPage() {
    const router = useRouter()
    const [data, setData] = useState<Offer[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [totalOffers, setTotalOffers] = useState(0)

    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true)
            try {
                const response = await adminOfferService.getAll({
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize
                });
                setData(response.data)
                setTotalOffers(response.count)
            } catch (error) {
                console.error("Failed to fetch offers", error)
            } finally {
                setLoading(false)
            }
        }

        fetchOffers()
    }, [pagination])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Offers Management</h1>
                <Button onClick={() => router.push('/admin/offers/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Offer
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={data}
                pageCount={Math.ceil(totalOffers / pagination.pageSize)}
                pagination={pagination}
                onPaginationChange={setPagination}
            />
        </div>
    )
}
