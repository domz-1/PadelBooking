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

    async updateUser(id, data) {
        const user = await User.findByPk(id);
        if (!user) return null;

        // Prevent updating sensitive fields through this method
        const { password, role, id: userId, ...updateData } = data;

        return await user.update(updateData);
    }

    async findPartners(filters) {
        const { level, region, limit, offset } = filters;
        const where = { isPublic: true };

        if (level) {
            // where.level = level;
        }

        return await User.findAndCountAll({
            where,
            limit,
            offset,
            attributes: ['id', 'name', 'image', 'bio', 'stats']
        });
    }

    async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) return null;
        return await user.destroy();
    }
}

module.exports = new UserService();
