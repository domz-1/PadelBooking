const User = require('../users/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
    async register(userData) {
        const user = await User.create(userData);
        return user;
    }

    async login(email, password) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        return user;
    }

    getSignedJwtToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        });
    }
}

module.exports = new AuthService();
