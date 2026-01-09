const express = require('express');
const { deleteMatch, getAllMatches } = require('./match.controller');
const { protect, authorize } = require('../../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));


router.get('/', getAllMatches);

router.delete('/:id', deleteMatch);

module.exports = router;
