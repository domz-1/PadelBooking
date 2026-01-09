const express = require('express');
const { createOffer, deleteOffer, getAllOffers } = require('./offer.controller');
const { protect, authorize } = require('../../../middleware/auth');
const { upload, convertImage } = require('../../../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));


router.route('/')
    .get(getAllOffers)
    .post(upload.single('image'), convertImage, createOffer);

router.delete('/:id', deleteOffer);

module.exports = router;
