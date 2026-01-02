import Navbar from "@/components/layout/Navbar";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
                {children}
            </main>
        </>
    );
}
