const User = require('./user.model');

class UserService {
    async createUser(userData) {
        return await User.create(userData);
    }

    async getUserById(id) {
        return await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
    }

    async getUserByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    async getAllUsers(options = {}) {
        const { limit, offset, where } = options;
        return await User.findAndCountAll({
            where,
            limit,
            offset,
            attributes: { exclude: ['password'] }
        });
    }

    async updateUser(id, updateData) {
        const user = await User.findByPk(id);
        if (!user) return null;
        return await user.update(updateData);
    }

    async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) return null;
        return await user.destroy();
    }
}

module.exports = new UserService();
