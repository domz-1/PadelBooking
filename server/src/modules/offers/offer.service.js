const Offer = require('./offer.model');
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

    async deleteOffer(id) {
        const offer = await Offer.findByPk(id);
        if (!offer) return null;
        return await offer.destroy();
    }
}

module.exports = new OfferService();
