const Venue = require('./venue.model');
const { Op } = require('sequelize');

class VenueService {
    async createVenue(venueData) {
        return await Venue.create(venueData);
    }

    async getVenueById(id) {
        return await Venue.findByPk(id);
    }

    async getAllVenues(options = {}) {
        const { limit, offset, search, minPrice, maxPrice } = options;
        const where = {};

        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        if (minPrice || maxPrice) {
            where.pricePerHour = {};
            if (minPrice) where.pricePerHour[Op.gte] = minPrice;
            if (maxPrice) where.pricePerHour[Op.lte] = maxPrice;
        }

        return await Venue.findAndCountAll({
            where,
            limit,
            offset
        });
    }

    async updateVenue(id, updateData) {
        const venue = await Venue.findByPk(id);
        if (!venue) return null;
        return await venue.update(updateData);
    }

    async deleteVenue(id) {
        const venue = await Venue.findByPk(id);
        if (!venue) return null;
        return await venue.destroy();
    }
}

module.exports = new VenueService();
