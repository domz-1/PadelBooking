"use client"

import { BranchForm } from "@/components/admin/branches/BranchForm"
import { useEffect, useState } from "react"
import type { Branch } from "@/lib/schemas"
import { adminBranchService } from "@/lib/services/admin/branches.service"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export default function EditBranchPage() {
    const params = useParams()
    const router = useRouter()
    const [branch, setBranch] = useState<Branch | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBranch = async () => {
            if (!params.id) return
            try {
                const data = await adminBranchService.getById(Number(params.id))
                setBranch(data)
            } catch (error) {
                console.error("Failed to fetch branch", error)
                toast.error("Failed to fetch branch details")
                router.push("/admin/branches")
            } finally {
                setLoading(false)
            }
        }
        fetchBranch()
    }, [params.id, router])

    if (loading) return <div>Loading...</div>
    if (!branch) return <div>Branch not found</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Edit Branch</h1>
                <p className="text-muted-foreground">
                    Update branch details.
                </p>
            </div>
            <BranchForm initialData={branch} isEditing />
        </div>
    )
}
