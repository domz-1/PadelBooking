
import { cn } from "@/lib/utils"

interface ClientPageProps {
    children: React.ReactNode
    title?: string
    description?: string
    className?: string
}

export function ClientPage({
    children,
    title,
    description,
    className,
}: ClientPageProps) {
    return (
        <div className={cn("container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}>
            {(title || description) && (
                <div className="mb-8 space-y-2">
                    {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    )
}
