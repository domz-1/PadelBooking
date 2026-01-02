"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
    title?: string
    description?: string
    triggerText?: React.ReactNode
    onConfirm: () => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "contact"
    triggerSize?: "default" | "sm" | "lg" | "icon"
    children?: React.ReactNode // Allow custom trigger if needed
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ConfirmDialog({
    title = "Are you sure?",
    description = "This action cannot be undone.",
    triggerText,
    onConfirm,
    variant = "destructive",
    triggerSize = "default",
    children,
    open,
    onOpenChange
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {children ? (
                <AlertDialogTrigger asChild>
                    {children}
                </AlertDialogTrigger>
            ) : triggerText ? (
                <AlertDialogTrigger asChild>
                    <Button variant={variant} size={triggerSize}>{triggerText}</Button>
                </AlertDialogTrigger>
            ) : null}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className={variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
