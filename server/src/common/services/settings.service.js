const GlobalConfig = require('../../api/modules/settings/globalConfig.model');
const Category = require('../../api/modules/settings/category.model');
const BookingStatus = require('../../api/modules/settings/bookingStatus.model');

class SettingsService {
    // Global Config
    async getConfig() {
        let config = await GlobalConfig.findOne();
        if (!config) {
            config = await GlobalConfig.create({});
        }
        return config;
    }

    async updateConfig(data) {
        let config = await GlobalConfig.findOne();
        if (!config) {
            config = await GlobalConfig.create(data);
        } else {
            await config.update(data);
        }
        return config;
    }

    // Categories
    async createCategory(data) {
        return await Category.create(data);
    }

    async getAllCategories() {
        return await Category.findAll();
    }

    async updateCategory(id, data) {
        const category = await Category.findByPk(id);
        if (!category) return null;
        return await category.update(data);
    }

    async deleteCategory(id) {
        const category = await Category.findByPk(id);
        if (!category) return null;
        return await category.destroy();
    }

    // Booking Statuses
    async createBookingStatus(data) {
        return await BookingStatus.create(data);
    }

    async getAllBookingStatuses() {
        return await BookingStatus.findAll();
    }

    async updateBookingStatus(id, data) {
        const status = await BookingStatus.findByPk(id);
        if (!status) return null;
        return await status.update(data);
    }

    async deleteBookingStatus(id) {
        const status = await BookingStatus.findByPk(id);
        if (!status) return null;
        return await status.destroy();
    }

    // Analysis
    async getAnalysis() {
        const User = require('../users/user.model');
        const Booking = require('../bookings/booking.model');
        const Venue = require('../venues/venue.model');

        const totalUsers = await User.count();
        const totalBookings = await Booking.count();
        const totalVenues = await Venue.count();

        const revenue = await Booking.sum('totalPrice', {
            where: { status: 'confirmed' }
        });

        return {
            totalUsers,
            totalBookings,
            totalVenues,
            totalRevenue: revenue || 0
        };
    }
}

module.exports = new SettingsService();
