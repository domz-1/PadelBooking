const express = require('express');
const { createVenue, updateVenue, deleteVenue, getVenues, getVenue } = require('./venue.controller');
const { protect, authorize } = require('../../../middleware/auth');
const { upload, convertImage } = require('../../../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));


router.route('/')
    .get(getVenues)
    .post(upload.array('images', 5), convertImage, createVenue);

router.route('/:id')
    .get(getVenue)
    .put(upload.array('images', 5), convertImage, updateVenue)
    .delete(deleteVenue);

module.exports = router;
