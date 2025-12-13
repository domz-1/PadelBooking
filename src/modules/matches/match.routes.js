const express = require('express');
const { createMatch, getOpenMatches, joinMatch, handleRequest } = require('./match.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getOpenMatches)
    .post(createMatch);

router.post('/:id/join', joinMatch);
router.put('/requests/:requestId', handleRequest);

module.exports = router;
