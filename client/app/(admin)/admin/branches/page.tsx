"use client"

import { useEffect, useState } from "react"
import type { Branch } from "@/lib/schemas"
import { adminBranchService } from "@/lib/services/admin/branches.service"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function AdminBranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const data = await adminBranchService.getAll()
                setBranches(data)
            } catch (error) {
                console.error("Failed to fetch branches", error)
                toast.error("Failed to fetch branches")
            } finally {
                setLoading(false)
            }
        }
        fetchBranches()
    }, [])

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Branches</h1>
                    <p className="text-muted-foreground">
                        Manage your branches and locations.
                    </p>
                </div>
                <Button onClick={() => router.push("/admin/branches/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Branch
                </Button>
            </div>

            <DataTable columns={columns} data={branches} searchKey="name" />
        </div>
    )
}
