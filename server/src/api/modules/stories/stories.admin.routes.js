const express = require('express');
const { deleteStory } = require('./story.controller');
const { protect, authorize } = require('../../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));


router.delete('/:id', deleteStory);

module.exports = router;
