const express = require('express');
const { getPublicBookings, getFreeSlots } = require('./booking.controller');

const router = express.Router();

require('./docs/public.swagger.js');

router.get('/', getPublicBookings);
router.get('/free-slots', getFreeSlots);

module.exports = router;
