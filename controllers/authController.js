const User = require('../models/User');
const { ErrorResponse } = require('../utils/errorHandler');
const { generateToken } = require('../utils/tokenUtils');
const bcrypt = require('bcryptjs');

exports.register = async (req, res, next) => {
    try {
        const { fullName, password, phone } = req.body;

        // Check if phone/username already exists
        const existingUser = await User.findOne({ 
            $or: [
                { phone: phone },
                { username: phone }
            ]
        });

        if (existingUser) {
            return next(new ErrorResponse('Phone number already registered', 400));
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            fullName,
            password: hashedPassword,
            phone,
            username: phone, // Set username same as phone
        });

        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            token,
            data: {
                fullName: user.fullName,
                phone: user.phone,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return next(new ErrorResponse('Please provide username and password', 400));
        }

        // Normalize phone number format by removing any non-digit characters
        const normalizedUsername = username.toString().replace(/\D/g, '');

        // Find user by normalized username/phone and include password field
        const user = await User.findOne({ 
            $or: [
                { username: normalizedUsername },
                { phone: normalizedUsername }
            ]
        }).select('+password');

        // Check if user exists
        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Send response with user data and token
        res.status(200).json({
            success: true,
            token,
            data: {
                fullName: user.fullName,
                phone: user.phone,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        // Simply return success message since JWT tokens are stateless
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};
