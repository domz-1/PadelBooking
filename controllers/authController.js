const User = require('../models/User');
const { ErrorResponse } = require('../utils/errorHandler');
const { generateToken } = require('../utils/tokenUtils');

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        const user = await User.create({ 
            name, 
            email, 
            password,
            phone 
        });
        const token = generateToken(user._id);
        res.status(201).json({ 
            success: true, 
            token,
            data: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }
        const token = generateToken(user._id);
        res.status(200).json({ 
            success: true, 
            token,
            data: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};
