const Offer = require('../../api/modules/offers/offer.model');
const { Op } = require('sequelize');

class OfferService {
    async createOffer(data) {
        return await Offer.create(data);
    }

    async getActiveOffers() {
        return await Offer.findAll({
            where: {
                validUntil: {
                    [Op.gte]: new Date()
                }
            }
        });
    }

    async getAllOffers(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Offer.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return { count, rows, page, limit };
    }

    async deleteOffer(id) {
        const offer = await Offer.findByPk(id);
        if (!offer) return null;
        return await offer.destroy();
    }
}

module.exports = new OfferService();
