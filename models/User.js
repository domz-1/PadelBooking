const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please add a your name'],
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        match: [
            /^01[0125][0-9]{8}$/,
            'Please add a valid Egyptian phone number (11 digits starting with 01)',
        ],
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'manager'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Add this line to create and export the model
module.exports = mongoose.model('User', userSchema);
