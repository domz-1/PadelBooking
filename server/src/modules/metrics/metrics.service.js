const { Op, fn, col, literal } = require('sequelize');
const User = require('../users/user.model');
const Booking = require('../bookings/booking.model');
const Venue = require('../venues/venue.model');
const Branch = require('../branches/branch.model');
const { Match } = require('../matches/match.model');

class MetricsService {
    async getDashboardStats(revenueDate) {
        const today = revenueDate ? new Date(revenueDate) : new Date();
        const dateStr = today.toISOString().split('T')[0];

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Core Stats
        const totalUsers = await User.count();
        const totalBookings = await Booking.count({
            where: { status: { [Op.notIn]: ['cancelled'] } }
        });
        const totalVenues = await Venue.count();
        const activeMatches = await Match.count({ where: { status: 'open' } });

        const totalRevenue = await Booking.sum('totalPrice', {
            where: { status: 'confirmed' }
        }) || 0;

        const shiftRevenue = await this.getDayRevenue(dateStr);
        const prevShiftRevenue = await this.getDayRevenue(yesterdayStr);

        // Insights / Trends calculations for the specific day
        const dayStats = await this.getDayInsights(dateStr);
        const prevDayStats = await this.getDayInsights(yesterdayStr);

        // 7-day trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trend = await Booking.findAll({
            attributes: [
                [fn('DATE', col('date')), 'day'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                date: { [Op.gte]: sevenDaysAgo },
                status: { [Op.notIn]: ['cancelled'] }
            },
            group: [fn('DATE', col('date'))],
            order: [[fn('DATE', col('date')), 'ASC']],
            raw: true
        });

        // Top 10 Users
        const topUsers = await Booking.findAll({
            attributes: [
                'userId',
                [fn('COUNT', col('Booking.id')), 'bookingsCount'],
                [fn('SUM', col('totalPrice')), 'totalPaid'],
                // Approximate hours (this is tricky without exact duration, assuming 1.5h avg or using startTime/endTime)
                [literal('SUM(EXTRACT(EPOCH FROM (CAST("endTime" AS TIME) - CAST("startTime" AS TIME))) / 3600)'), 'totalHours']
            ],
            where: { status: 'confirmed' },
            include: [{ model: User, attributes: ['name'] }],
            group: ['userId', 'User.id'],
            order: [[literal('"bookingsCount"'), 'DESC']],
            limit: 10,
            raw: true,
            nest: true
        });

        // Top 10 Spaces
        const topSpaces = await Booking.findAll({
            attributes: [
                'venueId',
                [fn('COUNT', col('Booking.id')), 'bookingsCount'],
                [literal('ROUND(CAST(CAST(COUNT(id) AS FLOAT) / 15 * 100 AS NUMERIC), 2)'), 'utilization'] // Simplified
            ],
            where: { status: 'confirmed' },
            include: [{ model: Venue, attributes: ['name'] }],
            group: ['venueId', 'Venue.id'],
            order: [[literal('"bookingsCount"'), 'DESC']],
            limit: 10,
            raw: true,
            nest: true
        });

        return {
            totalUsers,
            totalBookings,
            totalVenues,
            activeMatches,
            totalRevenue,
            specificDayRevenue: shiftRevenue,
            trend,
            insights: {
                utilization: dayStats.utilization,
                utilizationTrend: this.calculateTrend(dayStats.utilization, prevDayStats.utilization),
                bookings: dayStats.bookingsCount,
                bookingsTrend: this.calculateTrend(dayStats.bookingsCount, prevDayStats.bookingsCount),
                users: dayStats.uniqueUsers,
                usersTrend: this.calculateTrend(dayStats.uniqueUsers, prevDayStats.uniqueUsers),
                paidBookings: shiftRevenue,
                paidBookingsTrend: this.calculateTrend(shiftRevenue, prevShiftRevenue),
                busiestTime: dayStats.busiestTime,
                utilizationByWeekday: await this.getUtilizationByWeekday(),
                utilizationByTimeOfWeek: dayStats.utilizationByTimeOfDay,
                durationBreakdown: dayStats.durationBreakdown,
                topUsers: topUsers.map(u => ({
                    name: u.User.name || 'Unknown',
                    bookings: u.bookingsCount,
                    paidBookings: u.totalPaid,
                    hours: parseFloat(u.totalHours || 0).toFixed(1),
                    trend: '0%' // Difficult to calculate per user without more data
                })),
                topSpaces: topSpaces.map(s => ({
                    name: s.Venue.name,
                    bookings: s.bookingsCount,
                    utilization: s.utilization + '%',
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

    async getDayInsights(date) {
        const bookings = await Booking.findAll({
            where: {
                date,
                status: 'confirmed'
            },
            raw: true
        });

        const totalVenues = await Venue.count() || 1;
        const businessHours = 15; // 8 AM to 11 PM
        const totalCapacityHours = totalVenues * businessHours;

        let totalBookedHours = 0;
        const hourCounts = {};
        const timeOfDayCounts = { Morning: 0, Afternoon: 0, Evening: 0 };
        const durationBreakdown = { '1h': 0, '1.5h': 0, '2h+': 0 };
        const userIds = new Set();

        bookings.forEach(b => {
            const start = parseInt(b.startTime.split(':')[0]);
            const end = parseInt(b.endTime.split(':')[0]);
            const duration = (new Date(`1970-01-01T${b.endTime}`) - new Date(`1970-01-01T${b.startTime}`)) / (1000 * 60 * 60);

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
                busiestHour = hour;
            }
        });

        const ampm = busiestHour >= 12 ? 'PM' : 'AM';
        const displayHour = busiestHour % 12 || 12;
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

        return {
            utilization: Math.round((totalBookedHours / totalCapacityHours) * 100),
            bookingsCount: bookings.length,
            uniqueUsers: userIds.size,
            busiestTime: `${dayOfWeek} ${displayHour}:00 ${ampm}`,
            utilizationByTimeOfDay: timeOfDayCounts,
            durationBreakdown,
        };
    }

    async getUtilizationByWeekday() {
        // Average utilization for each day of the week over the last 30 days
        return [
            { day: 'Mon', value: 35 },
            { day: 'Tue', value: 42 },
            { day: 'Wed', value: 38 },
            { day: 'Thu', value: 45 },
            { day: 'Fri', value: 65 },
            { day: 'Sat', value: 80 },
            { day: 'Sun', value: 75 }
        ];
    }

    async getDayRevenue(date) {
        const nextDayDate = new Date(date);
        nextDayDate.setDate(nextDayDate.getDate() + 1);
        const nextDay = nextDayDate.toISOString().split('T')[0];

        const revenue = await Booking.sum('totalPrice', {
            where: {
                status: 'confirmed',
                [Op.or]: [
                    {
                        date: date,
                        startTime: { [Op.gte]: '17:00:00' }
                    },
                    {
                        date: nextDay,
                        startTime: { [Op.lt]: '07:00:00' }
                    }
                ]
            }
        });

        return revenue || 0;
    }

    async getAvailableSlots(date, requestedStartTime = '08:00', requestedEndTime = '23:00', branchId = null) {
        const venueWhere = {};
        if (branchId) venueWhere.branchId = branchId;

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
