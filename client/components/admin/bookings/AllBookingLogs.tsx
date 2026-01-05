"use client"

import { useState, useEffect } from "react"
import { adminBookingService } from "@/lib/services/admin/bookings.service"
import { type BookingLog } from "@/lib/schemas"
import { toast } from "sonner"
import {
    Clock,
    User,
    Shield,
    Calendar,
    Search,
    Filter,
    X,
    RefreshCw,
    Download
} from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface BookingLogsResponse {
    success: boolean;
    data: BookingLog[];
    count: number;
    totalPages: number;
    currentPage: number;
}

export function AllBookingLogs() {
    const [logs, setLogs] = useState<BookingLog[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [actionFilter, setActionFilter] = useState('all')
    const [dateRange, setDateRange] = useState('all')
    const [expandedLog, setExpandedLog] = useState<BookingLog | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        totalPages: 1,
        total: 0
    })

    const fetchLogs = useCallback(async (page: number = 1) => {
        setLoading(true)
        try {
            // Calculate date range based on selection
            let startDate: string | undefined;
            let endDate: string | undefined;

            if (dateRange !== 'all') {
                const now = new Date();
                if (dateRange === 'today') {
                    startDate = now.toISOString().split('T')[0];
                    endDate = now.toISOString().split('T')[0];
                } else if (dateRange === 'week') {
                    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    startDate = oneWeekAgo.toISOString().split('T')[0];
                    endDate = now.toISOString().split('T')[0];
                } else if (dateRange === 'month') {
                    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    startDate = oneMonthAgo.toISOString().split('T')[0];
                    endDate = now.toISOString().split('T')[0];
                }
            }

            const response: BookingLogsResponse = await adminBookingService.getBookingLogs({
                page: page.toString(),
                limit: pagination.limit.toString(),
                action: actionFilter !== 'all' ? actionFilter : undefined,
                startDate,
                endDate,
                searchTerm
            })
            setLogs(response.data)
            setPagination({
                page: response.currentPage,
                limit: pagination.limit,
                totalPages: response.totalPages,
                total: response.count
            })
        } catch (error: unknown) {
            console.error("Failed to fetch booking logs", error)
            toast.error("Failed to fetch booking logs")
        } finally {
            setLoading(false)
        }
    }, [actionFilter, dateRange, searchTerm, pagination.limit])

    useEffect(() => {
        fetchLogs(1)
    }, [actionFilter, searchTerm, dateRange, fetchLogs])

    const filteredLogs = logs

    const getActionBadgeVariant = (action: string) => {
        const variants: Record<string, { variant: 'default' | 'outline' | 'destructive' | 'secondary' | null, className: string }> = {
            'create': { variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
            'update': { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
            'delete': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' },
            'system': { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' }
        }
        return variants[action] || variants.system
    }

    const formatLogDetails = (details: Record<string, unknown> | null) => {
        if (!details) return 'No details available'

        try {
            const formatted: string[] = []

            // Add user info if available
            if (details.userName) {
                formatted.push(`👤 User: ${details.userName} (${details.userEmail})`)
            }

            // Add booking info
            if (details.date) {
                formatted.push(`📅 Date: ${details.date}`)
            }
            if (details.startTime && details.endTime) {
                formatted.push(`⏰ Time: ${details.startTime} - ${details.endTime}`)
            }
            if (details.status) {
                formatted.push(`🏷️ Status: ${details.status}`)
            }
            if (details.totalPrice) {
                formatted.push(`💰 Price: $${details.totalPrice}`)
            }

            // Add changes if this is an update
            if (details.changes) {
                formatted.push('🔄 Changes:')
                Object.entries(details.changes).forEach(([field, change]: [string, Record<string, unknown>]) => {
                    if (change && typeof change === 'object' && 'from' in change && 'to' in change) {
                        formatted.push(`  - ${field}: ${change.from} → ${change.to}`)
                    } else {
                        formatted.push(`  - ${field}: ${JSON.stringify(change)}`)
                    }
                })
            }

            // For update actions, also show updateData if available
            if (details.action === 'update' && details.updateData) {
                formatted.push('\n📝 Updated Fields:')
                Object.entries(details.updateData).forEach(([field, value]) => {
                    formatted.push(`  - ${field}: ${value}`)
                })
            }

            // For create operations, show creation data
            if (details.action === 'create') {
                if (details.type) formatted.push(`📋 Type: ${details.type}`)
                if (details.isRecurring) formatted.push('🔁 Recurring: Yes')
                if (details.recurrenceDetails) {
                    formatted.push(`  - Frequency: ${details.recurrenceDetails.frequency}`)
                    formatted.push(`  - Count: ${details.recurrenceDetails.count}`)
                }
            }

            // For delete operations, show original data
            if (details.action === 'delete' && details.originalData) {
                formatted.push('\n🗑️ Original Data:')
                Object.entries(details.originalData).forEach(([field, value]) => {
                    formatted.push(`  - ${field}: ${value}`)
                })
            }

            // For open match operations
            if (details.action === 'convert_to_open_match') {
                formatted.push('\n🔄 Open Match Conversion:')
                if (details.previousData) {
                    formatted.push('  Previous State:')
                    Object.entries(details.previousData).forEach(([field, value]) => {
                        formatted.push(`    - ${field}: ${JSON.stringify(value)}`)
                    })
                }
                if (details.newData) {
                    formatted.push('  New State:')
                    Object.entries(details.newData).forEach(([field, value]) => {
                        formatted.push(`    - ${field}: ${JSON.stringify(value)}`)
                    })
                }
            }

            if (details.action === 'join_open_match' || details.action === 'leave_open_match') {
                formatted.push(`\n👥 ${details.action === 'join_open_match' ? 'Join' : 'Leave'} Open Match:`)
                if (details.previousPlayers) {
                    formatted.push(`  - Before: [${details.previousPlayers.join(', ')}]`)
                }
                if (details.updatedPlayers) {
                    formatted.push(`  - After: [${details.updatedPlayers.join(', ')}]`)
                }
                if (details.userId) {
                    formatted.push(`  - User ID: ${details.userId}`)
                }
            }

            return formatted.join('\n')
        } catch (error) {
            return JSON.stringify(details, null, 2)
        }
    }

    const actionTypes = [...new Set(logs.map(log => log.action))]

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchLogs(newPage)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Booking Activity Logs</h1>
                    <p className="text-muted-foreground">
                        Track all booking activities across the system
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Logs
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>
                        Filter booking logs by various criteria
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <Search className="w-4 h-4" />
                                Search
                            </label>
                            <Input
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <Filter className="w-4 h-4" />
                                Action Type
                            </label>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    {actionTypes.map(action => (
                                        <SelectItem key={action} value={action}>
                                            {action.charAt(0).toUpperCase() + action.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Date Range
                            </label>
                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">Last 7 Days</SelectItem>
                                    <SelectItem value="month">Last 30 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 flex items-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('')
                                    setActionFilter('all')
                                    setDateRange('all')
                                }}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading logs...</p>
                </div>
            ) : filteredLogs.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                            No booking logs found.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map((log) => {
                        const actionInfo = getActionBadgeVariant(log.action)
                        const logDate = new Date(log.timestamp)

                        return (
                            <Card key={log.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <Badge variant={actionInfo.variant} className={actionInfo.className + " capitalize"}>
                                                {log.action}
                                            </Badge>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm text-muted-foreground">
                                                    {format(logDate, 'MMM dd, yyyy • hh:mm a')}
                                                </span>
                                                {log.User && (
                                                    <div className="flex items-center gap-1 text-xs bg-secondary px-2 py-0.5 rounded-full">
                                                        <User className="w-3 h-3" />
                                                        {log.User.name}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm mb-2">
                                                <span className="font-medium">Booking #{log.bookingId}</span> - 
                                                {log.action === 'create' && ' Booking created'}
                                                {log.action === 'update' && ' Booking updated'}
                                                {log.action === 'delete' && ' Booking deleted'}
                                            </p>
                                            <div className="text-xs text-muted-foreground line-clamp-2">
                                                {formatLogDetails(log.details).split('\n')[0]}
                                                {log.details && Object.keys(log.details).length > 1 && '...'}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setExpandedLog(log)}
                                            >
                                                <Shield className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Expanded Log Details Modal */}
            {expandedLog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-lg max-w-2xl max-h-[80vh] w-full overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold flex items-center gap-3">
                                    <Clock className="h-6 w-6 text-primary" />
                                    Log Details
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedLog(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Log Header */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold capitalize">{expandedLog.action}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {format(new Date(expandedLog.timestamp), 'MMMM dd, yyyy • hh:mm:ss a')}
                                                </p>
                                            </div>
                                            <Badge variant={getActionBadgeVariant(expandedLog.action).variant}
                                                   className={getActionBadgeVariant(expandedLog.action).className + " capitalize"}>
                                                {expandedLog.action}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {expandedLog.User && (
                                            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg mb-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{expandedLog.User.name}</p>
                                                    <p className="text-sm text-muted-foreground">{expandedLog.User.email}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {expandedLog.User.role || 'User'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Log Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4 text-sm">
                                            <pre className="bg-secondary/50 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                                                {formatLogDetails(expandedLog.details)}
                                            </pre>
                                        </div>
                                    </CardContent>
                                </Card>

                             
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}