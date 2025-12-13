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
        return await user.update(data);
    }

    async findPartners(filters) {
        const { level, region } = filters;
        const where = { isPublic: true };

        if (level) {
            // Assuming level is stored in stats or a separate field.
            // For simplicity, let's assume a 'level' field was added or we filter by rating
            // where.level = level;
        }

        // Basic implementation returning all public users for now, can be enhanced
        return await User.findAll({
            where,
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
