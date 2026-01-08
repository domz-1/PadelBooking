"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/admin/Overview";
import { EmptySlotsBoard } from "@/components/admin/EmptySlotsBoard";
import {
  metricsService,
  DashboardStats,
} from "@/lib/services/admin/metrics.service";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { format, subDays } from "date-fns";
import {
  Users,
  CalendarCheck,
  DollarSign,
  Loader2,
  Activity,
  Clock,
  TrendingUp,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useBranding } from "@/components/providers/BrandingProvider";

export default function AdminDashboardPage() {
  const { brandName } = useBranding();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(
    subDays(new Date(), 30),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(),
  );

  useEffect(() => {
    const fetchStats = async () => {
      if (!startDate || !endDate) return;
      setLoading(true);
      try {
        const res = await metricsService.getStats(
          format(startDate, "yyyy-MM-dd"),
          format(endDate, "yyyy-MM-dd")
        );
        // Backend returns { success: true, data: { ...stats } }
        // metricsService returns response.data
        if (res.data) {
          setStats(res.data);
        } else if (res && !('success' in res)) {
          // Fallback if data is returned directly
          setStats(res as any);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [startDate, endDate]);

  if (loading && !stats) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const insights = stats?.insights;

  const topCards = [
    {
      title: "Utilization",
      value: `${insights?.utilization || 0}%`,
      trend: insights?.utilizationTrend || "0%",
      icon: Activity,
      description: "Space usage efficiency",
    },
    {
      title: "Bookings",
      value: (insights?.bookings || 0).toString(),
      trend: insights?.bookingsTrend || "0%",
      icon: CalendarCheck,
      description: "Confirmed slots today",
    },
    {
      title: "Users",
      value: (insights?.users || 0).toString(),
      trend: insights?.usersTrend || "0%",
      icon: Users,
      description: "Active players today",
    },
    {
      title: "Busiest time",
      value: insights?.busiestTime || "N/A",
      icon: Clock,
      description: "Peak booking hour",
    },
    {
      title: "Period Revenue",
      value: `EGP ${(insights?.paidBookings || 0).toLocaleString()}`,
      trend: insights?.paidBookingsTrend || "0%",
      icon: DollarSign,
      description: "Revenue in selected range",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Branding */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">{brandName}</h1>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm font-medium text-gray-500">
            System admin mode
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Label
              className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
            >
              Start
            </Label>
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              className="h-9 w-[160px] text-xs font-medium border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label
              className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
            >
              End
            </Label>
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              className="h-9 w-[160px] text-xs font-medium border-gray-200"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 bg-gray-50/50">
        {/* Insights Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xs font-bold tracking-widest uppercase text-gray-600">
                Insights
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Last updated: {format(new Date(), "h:mm a")}
            </p>
          </div>
          <p className="text-sm text-gray-500 max-w-3xl">
            Drive your space-management strategy by identifying trends, patterns
            and optimization opportunities.
            <span className="text-primary cursor-pointer hover:underline inline-flex items-center gap-1 ml-1">
              Learn about all the metrics here{" "}
              <ExternalLink className="h-3 w-3" />
            </span>
          </p>
        </div>

        {/* Main Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topCards.map((card, i) => (
            <Card
              key={i}
              className="border-none shadow-sm hover:shadow-md transition-all group"
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <card.icon className="h-5 w-5 text-gray-600 group-hover:text-primary" />
                  </div>
                  {card.trend && (
                    <div
                      className={`flex items-center text-xs font-bold ${card.trend.startsWith("+") ? "text-green-600" : "text-gray-500"}`}
                    >
                      {card.trend.startsWith("+") ? (
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      ) : null}
                      {card.trend}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 truncate">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {card.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Utilization Charts */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">
                  Utilization by weekday
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Overview data={stats?.insights?.utilizationByWeekday || []} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">
                    Utilization by time of week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(insights?.utilizationByTimeOfWeek || {}).map(
                    ([time, value]) => (
                      <div key={time} className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{time}</span>
                          <span className="text-gray-400">
                            {Math.round(value as number)} hrs
                          </span>
                        </div>
                        <Progress
                          value={Math.min(((value as number) / 10) * 100, 100)}
                          className="h-1.5"
                        />
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">
                    Duration breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(insights?.durationBreakdown || {}).map(
                    ([duration, count]) => (
                      <div
                        key={duration}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm text-gray-600">
                            {duration}
                          </span>
                        </div>
                        <span className="text-sm font-bold">
                          {count} bookings
                        </span>
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">
                  Utilization timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                <Overview data={stats?.trend || []} />
              </CardContent>
            </Card>
          </div>

          {/* Top Lists & Board */}
          <div className="lg:col-span-3 space-y-6">
            {/* <EmptySlotsBoard /> */}

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white pb-4">
                <CardTitle className="text-base font-bold">
                  Top 10 users
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-y text-gray-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3 text-right">Bookings</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Hours</th>
                      <th className="px-4 py-3 text-center">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {insights?.topUsers.map((user, j) => (
                      <tr
                        key={j}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {user.bookings}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          EGP {user.paidBookings.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {user.hours}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] font-bold text-green-600">
                            {user.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white pb-4">
                <CardTitle className="text-base font-bold">
                  Top 10 spaces
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-y text-gray-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-4 py-3">Space</th>
                      <th className="px-4 py-3 text-right">Bookings</th>
                      <th className="px-4 py-3 text-right">Utilization</th>
                      <th className="px-4 py-3 text-center">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {insights?.topSpaces.map((space, k) => (
                      <tr
                        key={k}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[120px]">
                          {space.name}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {space.bookings}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {space.utilization}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] font-bold text-green-600">
                            {space.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
