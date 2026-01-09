const { Op, fn, col, literal } = require('sequelize');
const User = require('../../api/modules/users/user.model');
const Booking = require('../../api/modules/bookings/booking.model');
const Venue = require('../../api/modules/venues/venue.model');
const Branch = require('../../api/modules/branches/branch.model');
const { Match } = require('../../api/modules/matches/match.model');

class MetricsService {
    async getDashboardStats(startDate, endDate) {
        // Default to last 30 days if not provided
        if (!startDate || !endDate) {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            startDate = start.toISOString().split('T')[0];
            endDate = end.toISOString().split('T')[0];
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const prevEndDate = new Date(start);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        const prevStartDate = new Date(prevEndDate);
        prevStartDate.setDate(prevStartDate.getDate() - (diffDays - 1));

        const prevStartDateStr = prevStartDate.toISOString().split('T')[0];
        const prevEndDateStr = prevEndDate.toISOString().split('T')[0];

        // Core Stats (Total counts remain system-wide or period-specific? Assuming period specific for "Bookings" and "Revenue" but "Total Users" is system wide)
        const totalUsers = await User.count();
        const totalVenues = await Venue.count();
        const activeMatches = await Match.count({ where: { status: 'open' } });

        const totalRevenue = await Booking.sum('totalPrice', {
            where: { status: 'confirmed' }
        }) || 0;

        // Insights for current period
        const periodStats = await this.getRangeInsights(startDate, endDate);
        const prevPeriodStats = await this.getRangeInsights(prevStartDateStr, prevEndDateStr);

        // Revenue for periods
        const periodRevenue = await this.getRangeRevenue(startDate, endDate);
        const prevPeriodRevenue = await this.getRangeRevenue(prevStartDateStr, prevEndDateStr);

        // Timeline trend (daily counts for the selected period)
        const trend = await Booking.findAll({
            attributes: [
                [fn('DATE', col('Booking.date')), 'day'],
                [fn('COUNT', col('Booking.id')), 'count']
            ],
            where: {
                date: { [Op.between]: [startDate, endDate] },
                status: { [Op.notIn]: ['cancelled'] }
            },
            group: [fn('DATE', col('Booking.date'))],
            order: [[fn('DATE', col('Booking.date')), 'ASC']],
            raw: true
        });

        // Top 10 Users for the period
        const topUsers = await Booking.findAll({
            attributes: [
                'userId',
                [fn('COUNT', col('Booking.id')), 'bookingsCount'],
                [fn('SUM', col('totalPrice')), 'totalPaid'],
                [literal('SUM(CASE WHEN "endTime" < "startTime" THEN (EXTRACT(EPOCH FROM (CAST("endTime" AS TIME) - CAST("startTime" AS TIME))) / 3600) + 24 ELSE (EXTRACT(EPOCH FROM (CAST("endTime" AS TIME) - CAST("startTime" AS TIME))) / 3600) END)'), 'totalHours']
            ],
            where: {
                status: 'confirmed',
                date: { [Op.between]: [startDate, endDate] }
            },
            include: [{ model: User, attributes: ['name'] }],
            group: ['userId', 'User.id'],
            order: [[literal('"bookingsCount"'), 'DESC']],
            limit: 10,
            raw: true,
            nest: true
        });

        // Top 10 Spaces for the period
        const topSpaces = await Booking.findAll({
            attributes: [
                'venueId',
                [fn('COUNT', col('Booking.id')), 'bookingsCount'],
                [literal(`ROUND(CAST(CAST(COUNT("Booking"."id") AS FLOAT) / (15 * ${diffDays}) * 100 AS NUMERIC), 2)`), 'utilization']
            ],
            where: {
                status: 'confirmed',
                date: { [Op.between]: [startDate, endDate] }
            },
            include: [{ model: Venue, attributes: ['name'] }],
            group: ['venueId', 'Venue.id'],
            order: [[literal('"bookingsCount"'), 'DESC']],
            limit: 10,
            raw: true,
            nest: true
        });

        return {
            totalUsers,
            totalBookings: periodStats.bookingsCount, // Specific to period
            totalVenues,
            activeMatches,
            totalRevenue,
            specificDayRevenue: periodRevenue, // Now "period revenue"
            trend,
            insights: {
                utilization: periodStats.utilization,
                utilizationTrend: this.calculateTrend(periodStats.utilization, prevPeriodStats.utilization),
                bookings: periodStats.bookingsCount,
                bookingsTrend: this.calculateTrend(periodStats.bookingsCount, prevPeriodStats.bookingsCount),
                users: periodStats.uniqueUsers,
                usersTrend: this.calculateTrend(periodStats.uniqueUsers, prevPeriodStats.uniqueUsers),
                paidBookings: periodRevenue,
                paidBookingsTrend: this.calculateTrend(periodRevenue, prevPeriodRevenue),
                busiestTime: periodStats.busiestTime,
                utilizationByWeekday: await this.getUtilizationByWeekday(startDate, endDate),
                utilizationByTimeOfWeek: periodStats.utilizationByTimeOfDay,
                durationBreakdown: periodStats.durationBreakdown,
                topUsers: topUsers.map(u => ({
                    name: u.User?.name || 'Unknown',
                    bookings: u.bookingsCount,
                    paidBookings: u.totalPaid || 0,
                    hours: parseFloat(u.totalHours || 0).toFixed(1),
                    trend: '0%'
                })),
                topSpaces: topSpaces.map(s => ({
                    name: s.Venue?.name || 'Unknown',
                    bookings: s.bookingsCount,
                    utilization: (s.utilization || 0) + '%',
                    trend: '0%'
                }))
            }
        };
    }

    calculateTrend(current, previous) {
        if (!previous || previous === 0) return current > 0 ? '∞%' : '0%';
        const diff = ((current - previous) / previous) * 100;
        return (diff > 0 ? '+' : '') + diff.toFixed(0) + '%';
    }

    async getRangeInsights(startDate, endDate) {
        const bookings = await Booking.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] },
                status: 'confirmed'
            },
            raw: true
        });

        const totalVenues = await Venue.count() || 1;
        const businessHours = 15; // 8 AM to 11 PM
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalCapacityHours = totalVenues * businessHours * diffDays;

        let totalBookedHours = 0;
        const hourCounts = {};
        const timeOfDayCounts = { Morning: 0, Afternoon: 0, Evening: 0 };
        const durationBreakdown = { '1h': 0, '1.5h': 0, '2h+': 0 };
        const userIds = new Set();

        bookings.forEach(b => {
            const start = parseInt(b.startTime.split(':')[0]);
            const end = parseInt(b.endTime.split(':')[0]);

            // Correct duration calculation handling potential string issues and overnight bookings
            const [sh, sm] = b.startTime.split(':').map(Number);
            const [eh, em] = b.endTime.split(':').map(Number);
            let duration = (eh + em / 60) - (sh + sm / 60);
            if (duration < 0) duration += 24; // Handle overnight bookings

            totalBookedHours += duration;
            userIds.add(b.userId);

            // Busiest time
            for (let i = start; i < end; i++) {
                hourCounts[i] = (hourCounts[i] || 0) + 1;
            }

            // Time of day
            if (start < 12) timeOfDayCounts.Morning += duration;
            else if (start < 17) timeOfDayCounts.Afternoon += duration;
            else timeOfDayCounts.Evening += duration;

            // Duration
            if (duration <= 1) durationBreakdown['1h']++;
            else if (duration <= 1.5) durationBreakdown['1.5h']++;
            else durationBreakdown['2h+']++;
        });

        let busiestHour = 0;
        let maxBookings = 0;
        Object.entries(hourCounts).forEach(([hour, count]) => {
            if (count > maxBookings) {
                maxBookings = count;
                busiestHour = parseInt(hour);
            }
        });

        const ampm = busiestHour >= 12 ? 'PM' : 'AM';
        const displayHour = busiestHour % 12 || 12;

        return {
            utilization: Math.round((totalBookedHours / totalCapacityHours) * 100) || 0,
            bookingsCount: bookings.length,
            uniqueUsers: userIds.size,
            busiestTime: busiestHour !== 0 || maxBookings > 0 ? `${displayHour}:00 ${ampm}` : 'N/A',
            utilizationByTimeOfDay: timeOfDayCounts,
            durationBreakdown,
        };
    }

    async getUtilizationByWeekday(startDate, endDate) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const totalVenues = await Venue.count() || 1;
        const businessHours = 15;

        // Count how many of each weekday occur in the range
        const weekdayCounts = {};
        days.forEach(d => weekdayCounts[d] = 0);

        let curr = new Date(startDate);
        const end = new Date(endDate);
        while (curr <= end) {
            const dayName = days[curr.getDay()];
            weekdayCounts[dayName]++;
            curr.setDate(curr.getDate() + 1);
        }

        const stats = await Booking.findAll({
            attributes: [
                [literal("to_char(\"Booking\".\"date\", 'Dy')"), 'day'],
                [literal('SUM(CASE WHEN "endTime" < "startTime" THEN (EXTRACT(EPOCH FROM (CAST("endTime" AS TIME) - CAST("startTime" AS TIME))) / 3600) + 24 ELSE (EXTRACT(EPOCH FROM (CAST("endTime" AS TIME) - CAST("startTime" AS TIME))) / 3600) END)'), 'bookedHours']
            ],
            where: {
                date: { [Op.between]: [startDate, endDate] },
                status: 'confirmed'
            },
            group: [literal("to_char(\"Booking\".\"date\", 'Dy')")],
            raw: true
        });

        return days.map(d => {
            const stat = stats.find(s => s.day === d);
            const occurrences = weekdayCounts[d] || 1;
            const capacity = totalVenues * businessHours * occurrences;
            const hours = parseFloat(stat?.bookedHours || 0);
            return {
                day: d,
                value: Math.round((hours / capacity) * 100)
            };
        });
    }

    async getRangeRevenue(startDate, endDate) {
        const revenue = await Booking.sum('totalPrice', {
            where: {
                status: 'confirmed',
                date: { [Op.between]: [startDate, endDate] }
            }
        });

        return revenue || 0;
    }

    async getAvailableSlots(date, requestedStartTime = '08:00', requestedEndTime = '23:00', branchId = null) {
        const venueWhere = {};
        if (branchId && branchId !== 'all') venueWhere.branchId = branchId;

        const venues = await Venue.findAll({
            where: venueWhere,
            include: [{ model: Branch, attributes: ['name'] }]
        });

        const bookings = await Booking.findAll({
            where: {
                date,
                status: { [Op.notIn]: ['cancelled'] }
            },
            order: [['startTime', 'ASC']]
        });

        const result = {};

        venues.forEach(venue => {
            const branchName = venue.Branch?.name || 'Unassigned';
            if (!result[branchName]) result[branchName] = {};
            if (!result[branchName][venue.name]) result[branchName][venue.name] = [];

            const venueBookings = bookings.filter(b => b.venueId === venue.id);

            let currentTime = requestedStartTime;

            venueBookings.forEach(booking => {
                if (booking.startTime > currentTime) {
                    result[branchName][venue.name].push({
                        start: currentTime,
                        end: booking.startTime
                    });
                }
                if (booking.endTime > currentTime) {
                    currentTime = booking.endTime;
                }
            });

            if (currentTime < requestedEndTime) {
                result[branchName][venue.name].push({
                    start: currentTime,
                    end: requestedEndTime
                });
            }
        });

        return result;
    }
}

module.exports = new MetricsService();
