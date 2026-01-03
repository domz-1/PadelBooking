// Basic wrapper around sonner for shadcn compatibility

"use client"

import * as React from "react"
import { toast } from "sonner"

export const useToast = () => {
    return {
        toast: (props: any) => {
            // Mapping standard shadcn toast props to sonner
            if (props.variant === 'destructive') {
                toast.error(props.title, { description: props.description })
            } else {
                toast.success(props.title, { description: props.description })
            }
        },
        dismiss: (toastId?: string) => toast.dismiss(toastId),
    }
}
