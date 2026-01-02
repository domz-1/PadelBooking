"use client"

import { useEffect, useState } from "react"
import { Coach, coachService } from "@/lib/services/coaches.service"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

export default function CoachesPage() {
    const [data, setData] = useState<Coach[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCoaches = async () => {
            setLoading(true)
            try {
                const response = await coachService.getAll();
                // Client API usually returns distinct structure, ensuring array
                setData(response.data || [])
            } catch (error) {
                console.error("Failed to fetch coaches", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCoaches()
    }, [])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Coaches Management</h1>
            </div>
            <DataTable
                columns={columns}
                data={data}
            // Client side pagination is default if pageCount is not provided or handled by table
            // If we want server pagination, we need to implement it in hook or service.
            // Assuming client-side pagination for small list of coaches for now as client API might not support pagination params in the simple getAll
            />
        </div>
    )
}
