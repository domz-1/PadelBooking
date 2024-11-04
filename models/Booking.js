const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    holderPhoneNumber: {
        type: String,
        required: [true, 'Please provide a contact phone number'],
        match: [/^\+?[\d\s-]+$/, 'Please provide a valid phone number']
    },
    gameType: {
        type: String,
        enum: ['FOOTBALL', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'BADMINTON', 'OTHER'],
        required: [true, 'Please specify the type of game']
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking; 