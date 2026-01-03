"use client"

import { BranchForm } from "@/components/admin/branches/BranchForm"

export default function CreateBranchPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Create Branch</h1>
                <p className="text-muted-foreground">
                    Add a new branch to your organization.
                </p>
            </div>
            <BranchForm />
        </div>
    )
}
