const express = require('express');
const { getStories, createStory } = require('./story.controller');
const { protect } = require('../../../middleware/auth');

const router = express.Router();


router.route('/')
    .get(getStories)
    .post(protect, createStory);

module.exports = router;
