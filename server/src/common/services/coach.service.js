const Coach = require('../../api/modules/coaches/coach.model');
const Package = require('../../api/modules/coaches/package.model');
const User = require('../../api/modules/users/user.model');

class CoachService {
    async createCoachProfile(userId, data) {
        return await Coach.create({ ...data, userId });
    }

    async getCoachByUserId(userId) {
        return await Coach.findOne({ where: { userId }, include: [{ model: Package, as: 'packages' }] });
    }

    async getAllCoaches() {
        return await Coach.findAll({
            include: [
                { model: User, attributes: ['name', 'image'] },
                { model: Package, as: 'packages' }
            ]
        });
    }

    async createPackage(coachId, data) {
        return await Package.create({ ...data, coachId });
    }

    async deleteCoach(id) {
        const coach = await Coach.findByPk(id);
        if (!coach) return null;
        return await coach.destroy();
    }

    async deletePackage(id) {
        const pkg = await Package.findByPk(id);
        if (!pkg) return null;
        return await pkg.destroy();
    }

    async updatePackage(id, data) {
        const pkg = await Package.findByPk(id);
        if (!pkg) return null;
        return await pkg.update(data);
    }
}

module.exports = new CoachService();
