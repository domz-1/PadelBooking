import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
    active?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
            <Link
                href="/"
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="w-4 h-4" />
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="w-4 h-4 mx-2" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className={`hover:text-foreground transition-colors ${item.active ? "font-medium text-foreground" : ""
                                }`}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span
                            className={`${item.active ? "font-medium text-foreground" : ""}`}
                        >
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
