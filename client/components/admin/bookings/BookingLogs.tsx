"use client";

import { useState, useEffect } from "react";
import { adminBookingService } from "@/lib/services/admin/bookings.service";
import { type BookingLog } from "@/lib/schemas";
import { toast } from "sonner";
import {
  Clock,
  User,
  Shield,
  Calendar,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface BookingLogsProps {
  bookingId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingLogs({
  bookingId,
  open,
  onOpenChange,
}: BookingLogsProps) {
  const [logs, setLogs] = useState<BookingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [expandedLog, setExpandedLog] = useState<BookingLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await adminBookingService.getBookingLogs({
        bookingId: bookingId.toString(),
        limit: "100",
      });
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch booking logs", error);
      toast.error("Failed to fetch booking logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && bookingId) {
      fetchLogs();
    }
  }, [open, bookingId]);

  const filteredLogs = logs.filter((log) => {
    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      (log.action &&
        log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.User &&
        log.User.name &&
        log.User.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details &&
        JSON.stringify(log.details)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    // Filter by action
    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    // Filter by date range
    const logDate = new Date(log.timestamp);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const matchesDateRange =
      dateRange === "all" ||
      (dateRange === "week" && logDate >= oneWeekAgo) ||
      (dateRange === "month" && logDate >= oneMonthAgo) ||
      (dateRange === "today" && logDate.toDateString() === now.toDateString());

    return matchesSearch && matchesAction && matchesDateRange;
  });

  type ActionVariant = {
    variant: "default" | "outline" | "destructive" | "secondary";
    className: string;
  };

  const getActionBadgeVariant = (action: string): ActionVariant => {
    const variants: Record<string, ActionVariant> = {
      create: {
        variant: "default",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      update: {
        variant: "outline",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      delete: {
        variant: "destructive",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      system: {
        variant: "secondary",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
    };
    return variants[action] || variants.system;
  };

  interface LogChange {
    from: unknown;
    to: unknown;
  }

  interface RecurrenceDetails {
    frequency: string;
    count: number;
  }

  const formatLogDetails = (
    details: Record<string, unknown> | null | undefined,
  ) => {
    if (!details) return "No details available";

    try {
      const formatted: string[] = [];

      // Add user info if available
      if (details.userName) {
        formatted.push(`👤 User: ${details.userName} (${details.userEmail})`);
      }

      // Add action-specific info
      if (details.action === "create") {
        formatted.push("✅ Booking created");
        if (details.courtNumber) {
          formatted.push(`🏟️ Court: ${details.courtNumber}`);
        }
        if (details.totalPrice) {
          formatted.push(`💰 Price: $${details.totalPrice}`);
        }
      } else if (details.action === "update") {
        formatted.push("🔄 Booking updated");
      } else if (details.action === "delete") {
        formatted.push("🗑️ Booking deleted");
      }

      // Add changes if this is an update
      if (details.changes) {
        formatted.push("🔄 Changes:");
        Object.entries(details.changes as Record<string, LogChange>).forEach(
          ([field, change]) => {
            if (
              change &&
              typeof change === "object" &&
              "from" in change &&
              "to" in change
            ) {
              formatted.push(`  - ${field}: ${change.from} → ${change.to}`);
            } else {
              formatted.push(`  - ${field}: ${JSON.stringify(change)}`);
            }
          },
        );
      }

      // For recurring bookings
      if (details.isRecurring) formatted.push("🔁 Recurring: Yes");
      if (details.recurrenceDetails) {
        const recurrence = details.recurrenceDetails as RecurrenceDetails;
        formatted.push(`  - Frequency: ${recurrence.frequency}`);
        formatted.push(`  - Count: ${recurrence.count}`);
      }

      // For delete operations, show original data
      if (details.action === "delete" && details.originalData) {
        formatted.push("\n🗑️ Original Data:");
        Object.entries(details.originalData as Record<string, unknown>).forEach(
          ([field, value]) => {
            formatted.push(`  - ${field}: ${value}`);
          },
        );
      }

      // For open match operations
      if (details.action === "convert_to_open_match") {
        formatted.push("\n🔄 Open Match Conversion:");
        if (details.previousData) {
          formatted.push("  Previous State:");
          Object.entries(
            details.previousData as Record<string, unknown>,
          ).forEach(([field, value]) => {
            formatted.push(`    - ${field}: ${JSON.stringify(value)}`);
          });
        }
        if (details.newData) {
          formatted.push("  New State:");
          Object.entries(details.newData as Record<string, unknown>).forEach(
            ([field, value]) => {
              formatted.push(`    - ${field}: ${JSON.stringify(value)}`);
            },
          );
        }
      }

      // For waitlist operations
      if (details.action === "join_waitlist") {
        formatted.push("📝 Joined waitlist");
        if (details.waitlistPosition) {
          formatted.push(`  Position: ${details.waitlistPosition}`);
        }
      }

      if (details.action === "leave_waitlist") {
        formatted.push("📤 Left waitlist");
      }

      return formatted.length > 0
        ? formatted.join("\n")
        : "No details available";
    } catch (error) {
      console.error("Error formatting log details:", error);
      return "Error formatting details";
    }
  };

  const actionTypes = [...new Set(logs.map((log) => log.action))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-primary" />
            Booking Activity Logs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      {actionTypes.map((action) => (
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
                  {logs.length === 0
                    ? "No activity logs found for this booking."
                    : "No logs match the current filters."}
                </p>
                {logs.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setActionFilter("all");
                      setDateRange("all");
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const actionInfo = getActionBadgeVariant(log.action);
                const logDate = new Date(log.timestamp);

                return (
                  <Card
                    key={log.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <Badge
                            variant={actionInfo.variant}
                            className={actionInfo.className + " capitalize"}
                          >
                            {log.action}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">
                              {format(logDate, "MMM dd, yyyy • hh:mm a")}
                            </span>
                            {log.User && (
                              <div className="flex items-center gap-1 text-xs bg-secondary px-2 py-0.5 rounded-full">
                                <User className="w-3 h-3" />
                                {log.User.name}
                              </div>
                            )}
                          </div>
                          <p className="text-sm mb-2">
                            {log.action === "create" && "Booking created"}
                            {log.action === "update" && "Booking updated"}
                            {log.action === "delete" && "Booking deleted"}
                          </p>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {formatLogDetails(log.details).split("\n")[0]}
                            {log.details &&
                              Object.keys(log.details).length > 1 &&
                              "..."}
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
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>

      {/* Expanded Log Details Modal */}
      <Dialog open={!!expandedLog} onOpenChange={() => setExpandedLog(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              Log Details
            </DialogTitle>
          </DialogHeader>

          {expandedLog && (
            <div className="space-y-6 py-4">
              {/* Log Header */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {expandedLog.action}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(
                          new Date(expandedLog.timestamp),
                          "MMMM dd, yyyy • hh:mm:ss a",
                        )}
                      </p>
                    </div>
                    <Badge
                      variant={
                        getActionBadgeVariant(expandedLog.action).variant
                      }
                      className={
                        getActionBadgeVariant(expandedLog.action).className +
                        " capitalize"
                      }
                    >
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
                        <p className="text-sm text-muted-foreground">
                          {expandedLog.User.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {expandedLog.User.role || "User"}
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
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
