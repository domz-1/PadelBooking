const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a venue name'],
        unique: true
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    courts: [{
        name: String,
        type: {
            type: String,
            enum: ['indoor', 'outdoor'],
            required: true
        },
        surface: String,
        hourlyRate: Number,
        available: {
            type: Boolean,
            default: true
        }
    }],
    amenities: [String],
    openingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Venue', venueSchema); 