const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: true,
        default: 'Sports Venue Booking'
    },
    bookingRules: {
        maxBookingsPerDay: {
            type: Number,
            default: 2
        },
        maxAdvanceBookingDays: {
            type: Number,
            default: 14
        },
        cancellationPeriodHours: {
            type: Number,
            default: 24
        }
    },
    maintenance: {
        isUnderMaintenance: {
            type: Boolean,
            default: false
        },
        maintenanceMessage: String
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', settingsSchema); 