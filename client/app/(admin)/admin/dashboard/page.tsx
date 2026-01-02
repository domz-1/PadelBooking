export default function AdminDashboardPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium">Total Users</div>
                    <div className="text-2xl font-bold">120</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium">Active Bookings</div>
                    <div className="text-2xl font-bold">25</div>
                </div>
                {/* Metric placeholders */}
            </div>
        </div>
    );
}
