const userService = require('../../../common/services/user.service');

exports.getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { search, role, isGuest } = req.query;

        const { Op } = require('sequelize');
        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (role) {
            where.role = role;
        }

        if (isGuest !== undefined) {
            where.isGuest = isGuest === 'true';
        }

        const users = await userService.getAllUsers({ limit, offset, where });

        res.status(200).json({
            success: true,
            count: users.count,
            totalPages: Math.ceil(users.count / limit),
            currentPage: page,
            data: users.rows
        });
    } catch (error) {
        next(error);
    }
};

exports.createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id || req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.path;
        } else if (typeof req.body.image === 'object') {
            // If image came in as an object (e.g. from multipart parser artifact) and no file was uploaded, remove it
            delete req.body.image;
        }

        const user = await userService.updateUser(req.params.id, req.body);
        if (!user) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.banUser = async (req, res, next) => {
    try {
        const user = await userService.updateUser(req.params.id, { isActive: false });
        if (!user) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }

        // Cancel future bookings
        const bookingService = require('../bookings/booking.service');
        await bookingService.cancelFutureBookingsForUser(user.id);

        res.status(200).json({ success: true, data: user, message: 'User banned and future bookings cancelled' });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.path;
        }
        // Strip sensitive fields that should only be updated through specific methods or by admin
        const { password, role, id, ...allowedUpdates } = req.body;

        const user = await userService.updateUser(req.user.id, allowedUpdates);
        res.status(200).json({ success: true, data: user, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const User = require('../../../common/services/user.model');

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save(); // Model hook handles hashing

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};


exports.findPartners = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const partners = await userService.findPartners({
            ...req.query,
            limit,
            offset
        });

        res.status(200).json({
            success: true,
            count: partners.count,
            totalPages: Math.ceil(partners.count / limit),
            currentPage: page,
            data: partners.rows
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await userService.deleteUser(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: req.t('notFound') });
        }
        res.status(200).json({ success: true, data: {}, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};
