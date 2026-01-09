const express = require('express');
const { getConfig, getCategories, getBookingStatuses } = require('./settings.controller');

const router = express.Router();


router.get('/config', getConfig);

router.get('/categories', getCategories);

router.get('/booking-statuses', getBookingStatuses);

module.exports = router;
