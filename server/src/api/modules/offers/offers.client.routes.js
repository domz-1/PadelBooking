const express = require('express');
const { getOffers } = require('./offer.controller');

const router = express.Router();

// Public route or protected? Original was public getter, admin setter.
// Original: router.route('/').get(getOffers).post(...)
// So getter is public.


router.get('/', getOffers);

module.exports = router;
