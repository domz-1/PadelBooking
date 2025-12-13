const express = require('express');
const { getOffers, createOffer, deleteOffer } = require('./offer.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getOffers)
    .post(protect, authorize('admin'), createOffer);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteOffer);

module.exports = router;
