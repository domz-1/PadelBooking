const { Match, MatchRequest } = require('./match.model');
const User = require('../users/user.model');
const Venue = require('../venues/venue.model');

class MatchService {
    async createMatch(userId, data) {
        return await Match.create({ ...data, creatorId: userId });
    }

    async getOpenMatches() {
        return await Match.findAll({
            where: { status: 'open' },
            include: [
                { model: User, as: 'Creator', attributes: ['name', 'image'] },
                { model: Venue, attributes: ['name', 'location'] }
            ]
        });
    }

    async getAllMatches() {
        return await Match.findAll({
            include: [
                { model: User, as: 'Creator', attributes: ['name', 'image'] },
                { model: Venue, attributes: ['name', 'location'] }
            ],
            order: [['date', 'DESC']]
        });
    }

    async requestJoin(matchId, userId) {
        const match = await Match.findByPk(matchId);
        if (!match || match.status !== 'open') throw new Error('Match not available');

        // Check if already requested
        const existing = await MatchRequest.findOne({ where: { matchId, userId } });
        if (existing) throw new Error('Request already sent');

        return await MatchRequest.create({ matchId, userId });
    }

    async handleRequest(requestId, status, userId) {
        const request = await MatchRequest.findByPk(requestId, { include: [Match] });
        if (!request) throw new Error('Request not found');

        if (request.Match.creatorId !== userId) throw new Error('Unauthorized');

        await request.update({ status });

        // If accepted, check if match is full logic could be added here

        return request;
    }

    async deleteMatch(id) {
        const match = await Match.findByPk(id);
        if (!match) return null;
        return await match.destroy();
    }
}

module.exports = new MatchService();
