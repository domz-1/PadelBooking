const userService = require('./user.service');

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
        res.status(200).json({ success: true, data: user, message: 'User banned' });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.path;
        }
        const user = await userService.updateUser(req.user.id, req.body);
        res.status(200).json({ success: true, data: user, message: req.t('success') });
    } catch (error) {
        next(error);
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const User = require('./user.model');

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
