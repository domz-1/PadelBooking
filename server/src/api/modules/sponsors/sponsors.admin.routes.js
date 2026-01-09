const express = require('express');
const { createSponsor, updateSponsor, deleteSponsor, getSponsors, getSponsor } = require('./sponsor.controller');
const { protect, authorize } = require('../../../middleware/auth');
const { upload, convertImage } = require('../../../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));


router.route('/')
    .get(getSponsors)
    .post(upload.single('image'), convertImage, createSponsor);

router.route('/:id')
    .get(getSponsor)
    .put(upload.single('image'), convertImage, updateSponsor)
    .delete(deleteSponsor);

module.exports = router;
