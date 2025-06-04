const mongoose = require('mongoose');
const venueSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    name: {
        type: String,
        required: [true, 'Please add a venue name'],
        unique: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a venue description'],
    },
    image: {
        type: String,
        required: [true, 'Please upload a venue image'],
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
    },
    courts: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                auto: true
            },
            image: {
                type: String,
                required: [true, 'Please upload a court image'],
            },
            name: {
                type: String,
                required: [true, 'Please add a court name'],
            },
            type: {
                type: String, // Defines that this field will store string values
                enum: ['indoor', 'outdoor'], // Restricts the allowed values to either 'indoor' or 'outdoor'
                required: true, // Makes this field mandatory when creating a new court
            },
            minDuration: {
                type: Number,
                enum: [0.5, 1, 1.5, 2],
                required: true,
            },
            hourlyRate: {
                type: Number,
                required: true,
            },
            available: {
                type: Boolean,
                required: true,
                default: true,
            },
        },
    ],
    amenities: {
        type: [String],
        required: [true, 'Please specify venue amenities'],
    },
    openingHours: {
        monday: {
            open: { type: String, required: true },
            close: { type: String, required: true },
        },
        tuesday: {
            open: { type: String, required: true },
            close: { type: String, required: true },
        },
        wednesday: {
            open: { type: String, required: true },
            close: { type: String, required: true },
        },
        thursday: {
            open: { type: String, required: true },
            close: { type: String, required: true },
        },
        friday: {
            open: { type: String, required: true },
            close: { type: String, required: true },
        },
        saturday: {
            open: { type: String, required: true },
            close: { type: String, required: true },
        },
        sunday: {
            open: { type: String, required: true },
            close: { type: String, required: true },
        },
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    isActive : {
        type: Boolean,
        required: true,
        default: true,
    },
});
module.exports = mongoose.model('Venue', venueSchema);
