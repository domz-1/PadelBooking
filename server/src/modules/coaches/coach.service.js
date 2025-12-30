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
}

module.exports = new CoachService();
