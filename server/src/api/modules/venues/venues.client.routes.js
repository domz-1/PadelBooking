const express = require('express');
const { getVenues, getVenue } = require('./venue.controller');

const router = express.Router();


router.get('/', getVenues);

router.get('/:id', getVenue);

module.exports = router;
