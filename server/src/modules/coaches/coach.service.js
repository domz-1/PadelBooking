const Coach = require('./coach.model');
const Package = require('./package.model');
const User = require('../users/user.model');

class CoachService {
    async createCoachProfile(userId, data) {
        return await Coach.create({ ...data, userId });
    }

    async getCoachByUserId(userId) {
        return await Coach.findOne({ where: { userId }, include: [Package] });
    }

    async getAllCoaches() {
        return await Coach.findAll({
            include: [
                { model: User, attributes: ['name', 'image'] },
                { model: Package }
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
}

module.exports = new CoachService();
