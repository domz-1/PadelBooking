const Sport = require('../../api/modules/sports/sport.model');

class SportService {
    async createSport(data) {
        return await Sport.create(data);
    }

    async getAllSports() {
        return await Sport.findAll();
    }

    async getSportById(id) {
        return await Sport.findByPk(id);
    }

    async updateSport(id, data) {
        const sport = await Sport.findByPk(id);
        if (!sport) return null;
        return await sport.update(data);
    }

    async deleteSport(id) {
        const sport = await Sport.findByPk(id);
        if (!sport) return null;
        return await sport.destroy();
    }
}

module.exports = new SportService();
