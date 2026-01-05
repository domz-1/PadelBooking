const authService = require('./auth.service');

const normalizePhone = (phone) => {
    if (!phone) return null;
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, '');

    // If it starts with 01 (Egypt local), change to +201
    if (normalized.startsWith('01') && normalized.length === 11) {
        normalized = '+2' + normalized;
    }

    // Ensure no spaces or extra formatting remains
    return normalized;
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const normalizedPhone = normalizePhone(phone);

        // Check if email is already in use
        const existingEmail = await require('../users/user.model').findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        // Check if phone is already in use
        if (normalizedPhone) {
            const existingPhone = await require('../users/user.model').findOne({ where: { phone: normalizedPhone } });
            if (existingPhone) {
                return res.status(400).json({ success: false, message: 'Phone number already in use' });
            }
        }

        const user = await authService.register({ name, email, password, role, phone: normalizedPhone });
        const token = authService.getSignedJwtToken(user.id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        const user = await authService.login(email, password);
        const token = authService.getSignedJwtToken(user.id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};
