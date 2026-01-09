"use client";

import { useState, useEffect, useCallback } from "react";
import { adminBookingService } from "@/lib/services/admin/bookings.service";
import { type BookingLog } from "@/lib/schemas";
import { toast } from "sonner";
import { settingsService } from "@/lib/services/settings.service";
import { type BookingStatus } from "@/lib/types";
import {
  Clock,
  User,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Calendar,
  Shield,
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingLogsProps {
  bookingId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface BookingLogsListProps {
  bookingId: number;
  className?: string;
}

export function BookingLogsList({
  bookingId,
  className,
}: BookingLogsListProps) {
  const [logs, setLogs] = useState<BookingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [expandedLog, setExpandedLog] = useState<BookingLog | null>(null);
  const [statuses, setStatuses] = useState<BookingStatus[]>([]);
  const [allUsers, setAllUsers] = useState<
    { id: number; name: string; email: string }[]
  >([]);
  const [allVenues, setAllVenues] = useState<{ id: number; name: string }[]>(
    [],
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, statusesRes, venuesRes] = await Promise.all([
        adminBookingService.getBookingLogs({
          bookingId: bookingId.toString(),
          limit: "100",
        }),
        settingsService.getBookingStatuses(),
        adminBookingService.getVenues({ limit: 1000 }),
      ]);

      const logsData = logsRes.data;
      setLogs(logsData);
      setStatuses(statusesRes.data || []);

      // Build a comprehensive venue map
      const venueMap = new Map();
      (venuesRes.data || []).forEach(
        (v: { id: number | string; name: string }) =>
          venueMap.set(Number(v.id), v),
      );
      setAllVenues(Array.from(venueMap.values()));

      // Build a comprehensive user map from all users mentioned in logs
      const userMap = new Map();

      // 1. Add performers from logs (they are already included in the log objects)
      logsData.forEach((log: BookingLog) => {
        if (log.User) {
          userMap.set(Number(log.User.id), log.User);
        }
      });

      // 2. Fetch all users from the system (increase limit to be safer)
      const usersRes = await adminBookingService.getUsers({ limit: 1000 });
      (usersRes.data || []).forEach((u: { id: number; name: string; email: string }) => {
        if (!userMap.has(Number(u.id))) {
          userMap.set(Number(u.id), u);
        }
      });

      setAllUsers(Array.from(userMap.values()));
    } catch (error) {
      console.error("Failed to fetch booking logs", error);
      toast.error("Failed to fetch booking logs");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      fetchLogs();
    }
  }, [bookingId, fetchLogs]);

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
    fromLabel?: string;
    toLabel?: string;
  }

  interface RecurrenceDetails {
    frequency: string;
    count: number;
  }

  const formatFieldName = (field: string): string => {
    const map: Record<string, string> = {
      venueId: "Court",
      venueName: "Court",
      startTime: "Start Time",
      endTime: "End Time",
      totalPrice: "Price",
      date: "Date",
      courtNumber: "Court Number",
      status: "Status",
      statusId: "Status",
      userId: "Customer",
      targetUserName: "Customer",
      paymentStatus: "Payment Status",
      type: "Booking Type",
    };
    return map[field] || field.replace(/([A-Z])/g, " $1").trim(); // Fallback to Title Case
  };

  const formatValue = (
    field: string,
    value: unknown,
    details?: Record<string, unknown>,
  ): string => {
    if (value === null || value === undefined) return "-";

    if (field === "userId") {
      if (details?.targetUserName) return details.targetUserName as string;
      const userIdNum = Number(value);
      const user = allUsers.find((u) => Number(u.id) === userIdNum);
      return user ? user.name : `User #${userIdNum}`;
    }

    if (field === "venueId") {
      if (details?.venueName) return details.venueName as string;
      const venueIdNum = Number(value);
      const venue = allVenues.find((v) => Number(v.id) === venueIdNum);
      return venue ? venue.name : `Court #${venueIdNum}`;
    }

    if (field === "startTime" || field === "endTime") {
      return String(value).slice(0, 5); // Remove seconds
    }

    if (field === "totalPrice" || field === "price") {
      return `${Number(value).toFixed(2)} SAR`;
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return String(value);
  };

  const renderValue = (
    field: string,
    value: unknown,
    label?: string,
    details?: Record<string, unknown> | null,
  ) => {
    if (label) return <span>{label || ''}</span>;
    if (field === "userId" && details && details.targetUserName && typeof details.targetUserName === 'string')
      return <span>{details.targetUserName}</span>;
    if (field === "venueId" && details && details.venueName && typeof details.venueName === 'string')
      return <span>{details.venueName}</span>;

    if (field === "statusId") {
      const statusId = Number(value);
      const status = statuses.find((s) => s.id === statusId);
      if (status) {
        return (
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: status.color || "#000" }}
            />
            <span>{status.name}</span>
          </div>
        );
      }
    }
    return <span>{formatValue(field, value)}</span>;
  };

  const formatLogDetails = (
    details: Record<string, unknown> | null | undefined,
  ) => {
    if (!details) return "No details available";

    try {
      const formatted: string[] = [];

      // 1. Handle Changes (Updates)
      if (details.changes) {
        Object.entries(details.changes as Record<string, LogChange>).forEach(
          ([field, change]) => {
            if (
              change &&
              typeof change === "object" &&
              "from" in change &&
              "to" in change
            ) {
              const from =
                change.fromLabel || formatValue(field, change.from, details);
              const to =
                change.toLabel || formatValue(field, change.to, details);
              if (from !== to) {
                formatted.push(`• ${formatFieldName(field)}: ${from} → ${to}`);
              }
            }
          },
        );
      }

      // 2. Handle Action Specifics
      if (details.date && formatted.length === 0) {
        formatted.push(
          `• Court: ${details.venueName || formatValue("venueId", details.venueId, details)}`,
        );
        formatted.push(`• Date: ${details.date}`);
        formatted.push(`• Time: ${details.startTime} - ${details.endTime}`);
      }

      // 3. Special Actions (Open Match, Waitlist)
      if (details.action === "convert_to_open_match") {
        formatted.push("🔄 Converted to Open Match");
      } else if (details.action === "join_waitlist") {
        formatted.push(
          `📝 Joined waitlist${details.waitlistPosition ? ` (Position: ${details.waitlistPosition})` : ""}`,
        );
      } else if (details.action === "leave_waitlist") {
        formatted.push("📤 Left waitlist");
      }

      // 4. Recurring Info
      if (details.isRecurring) formatted.push("� Recurring series");
      if (details.recurrenceDetails) {
        const recurrence = details.recurrenceDetails as RecurrenceDetails;
        formatted.push(
          `• Cycle: ${recurrence.frequency} (${recurrence.count} matches)`,
        );
      }

      return formatted.length > 0
        ? formatted.join("\n")
        : "Action details logged";
    } catch (error) {
      console.error("Error formatting log details:", error);
      return "Log details technical view";
    }
  };

  const actionTypes = [...new Set(logs.map((log) => log.action))];

  return (
    <div className={className}>
      {expandedLog ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedLog(null)}
              className="hover:bg-accent"
            >
              ← Back to Logs
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Log Details</h2>
          </div>

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
                  variant={getActionBadgeVariant(expandedLog.action).variant}
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
                {expandedLog.action === "create" && expandedLog.details ? (
                  <div className="space-y-3">
                    <div className="font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Booking Created
                    </div>
                    <div className="grid gap-2">
                      {Object.entries(expandedLog.details).map(
                        ([field, value]) => {
                          // Skip internal metadata and redundant fields
                          if (
                            [
                              "logTimestamp",
                              "bookingSnapshotId",
                              "userName",
                              "userEmail",
                              "userRole",
                              "recurrenceDetails",
                              "seriesOption",
                            ].includes(field)
                          )
                            return null;

                          // Hide raw ID if Name field is also present
                          const details = expandedLog.details as Record<string, unknown> | undefined;
                          if (field === "userId" && details?.targetUserName)
                            return null;
                          if (field === "venueId" && details?.venueName)
                            return null;

                          return (
                            <div
                              key={field}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm border"
                            >
                              <span className="font-medium text-muted-foreground">
                                {formatFieldName(field)}
                              </span>
                              <Badge
                                variant="outline"
                                className="bg-background font-medium border-primary/20 text-primary"
                              >
                                {renderValue(
                                  field,
                                  value,
                                  undefined,
                                  expandedLog.details,
                                )}
                              </Badge>
                            </div>
                          );
                        },
                      )}
                      {!!expandedLog.details.recurrenceDetails && (
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm border">
                          <span className="font-medium text-muted-foreground">
                            Recurrence
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-background font-medium border-primary/20 text-primary"
                          >
                            {
                              (
                                expandedLog.details
                                  .recurrenceDetails as RecurrenceDetails
                              ).frequency
                            }{" "}
                            (
                            {
                              (
                                expandedLog.details
                                  .recurrenceDetails as RecurrenceDetails
                              ).count
                            }{" "}
                            times)
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ) : expandedLog.action === "delete" && expandedLog.details ? (
                  <div className="space-y-3">
                    <div className="font-medium text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Booking Deleted
                    </div>
                    <div className="grid gap-2">
                      {Object.entries(expandedLog.details).map(
                        ([field, value]) => {
                          // Skip metadata
                          if (
                            [
                              "logTimestamp",
                              "bookingSnapshotId",
                              "userName",
                              "userEmail",
                              "userRole",
                              "seriesOption",
                            ].includes(field)
                          )
                            return null;

                          // Consolidation
                          const details = expandedLog.details as Record<string, unknown> | undefined;
                          if (field === "userId" && details?.targetUserName)
                            return null;
                          if (field === "venueId" && details?.venueName)
                            return null;

                          return (
                            <div
                              key={field}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm border"
                            >
                              <span className="font-medium text-muted-foreground">
                                {formatFieldName(field)}
                              </span>
                              <Badge
                                variant="outline"
                                className="bg-destructive/10 border-destructive/20 text-destructive line-through decoration-destructive/50"
                              >
                                {renderValue(
                                  field,
                                  value,
                                  undefined,
                                  expandedLog.details,
                                )}
                              </Badge>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ) : expandedLog.details?.changes ? (
                  <div className="space-y-3">
                    <div className="font-medium text-muted-foreground flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" /> Changes Made
                    </div>
                    <div className="grid gap-2">
                      {Object.entries(
                        expandedLog.details.changes as Record<
                          string,
                          LogChange
                        >,
                      ).map(([field, change]) => {
                        const fromVal = formatValue(
                          field,
                          change.from,
                          expandedLog.details || undefined,
                        );
                        const toVal = formatValue(
                          field,
                          change.to,
                          expandedLog.details || undefined,
                        );
                        const isSame =
                          fromVal === toVal ||
                          (change.from === null && change.to === null);
                        const isDeleted =
                          (change.to === null ||
                            change.to === undefined ||
                            change.to === "") &&
                          change.from !== null &&
                          change.from !== undefined &&
                          change.from !== "";
                        const isAdded =
                          (change.from === null ||
                            change.from === undefined ||
                            change.from === "") &&
                          change.to !== null &&
                          change.to !== undefined &&
                          change.to !== "";

                        if (isSame) return null; // Skip if no visible change

                        return (
                          <div
                            key={field}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm border"
                          >
                            <span className="font-medium text-muted-foreground">
                              {formatFieldName(field)}
                            </span>
                            <div className="flex items-center gap-2">
                              {isDeleted ? (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="bg-background font-normal border-destructive/20 text-destructive line-through decoration-destructive/50"
                                  >
                                    {renderValue(
                                      field,
                                      change.from,
                                      change.fromLabel,
                                    )}
                                  </Badge>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  <Badge
                                    variant="outline"
                                    className="bg-destructive/10 border-destructive/20 text-destructive"
                                  >
                                    Deleted
                                  </Badge>
                                </>
                              ) : isAdded ? (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="bg-secondary text-muted-foreground"
                                  >
                                    None
                                  </Badge>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  <Badge
                                    variant="outline"
                                    className="bg-background font-medium border-primary/20 text-primary"
                                  >
                                    {renderValue(
                                      field,
                                      change.to,
                                      change.toLabel,
                                    )}
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="bg-background font-normal border-destructive/20 text-destructive line-through decoration-destructive/50"
                                  >
                                    {renderValue(
                                      field,
                                      change.from,
                                      change.fromLabel,
                                    )}
                                  </Badge>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  <Badge
                                    variant="outline"
                                    className="bg-background font-medium border-primary/20 text-primary"
                                  >
                                    {renderValue(
                                      field,
                                      change.to,
                                      change.toLabel,
                                    )}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <pre className="bg-secondary/50 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                    {formatLogDetails(expandedLog.details)}
                  </pre>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Booking Activity History</h3>
          </div>

          <div className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
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
                    <Select
                      value={actionFilter}
                      onValueChange={setActionFilter}
                    >
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
                      className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 group relative overflow-hidden"
                      style={{
                        borderLeftColor: actionInfo.className.includes("green")
                          ? "#22c55e"
                          : actionInfo.className.includes("blue")
                            ? "#3b82f6"
                            : actionInfo.className.includes("red")
                              ? "#ef4444"
                              : "#9ca3af",
                      }}
                      onClick={() => setExpandedLog(log)}
                    >
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center gap-4">
                          <div className="shrink-0">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105",
                                actionInfo.className,
                              )}
                            >
                              {log.action === "create" && (
                                <Calendar className="w-5 h-5" />
                              )}
                              {log.action === "update" && (
                                <RefreshCw className="w-5 h-5" />
                              )}
                              {log.action === "delete" && (
                                <Shield className="w-5 h-5" />
                              )}
                              {!["create", "update", "delete"].includes(
                                log.action,
                              ) && <Clock className="w-5 h-5" />}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                {log.action === "create" && "New Booking"}
                                {log.action === "update" && "Changes Saved"}
                                {log.action === "delete" && "Booking Removed"}
                                {!["create", "update", "delete"].includes(
                                  log.action,
                                ) &&
                                  `${log.action.charAt(0).toUpperCase() + log.action.slice(1)}`}
                              </h4>
                              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                {format(logDate, "hh:mm a")}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 overflow-hidden">
                              {log.User && (
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  by{" "}
                                  <span className="font-semibold text-foreground/80">
                                    {log.User.name}
                                  </span>
                                </span>
                              )}
                              <span className="text-[9px] text-muted-foreground/30">
                                •
                              </span>
                              <div className="text-[11px] text-muted-foreground line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity flex-1 min-w-0">
                                {formatLogDetails(log.details)
                                  .split("\n")
                                  .filter((line) => !line.includes("👤 User:"))
                                  .join(" • ")}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 ml-1">
                            <ArrowRight className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function BookingLogs({
  bookingId,
  open,
  onOpenChange,
}: BookingLogsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <BookingLogsList bookingId={bookingId} />
      </DialogContent>
    </Dialog>
  );
}
