const express = require('express');
const { getCoaches, createProfile, createPackage } = require('./coach.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.get('/', getCoaches);
router.post('/profile', protect, createProfile); // User becomes coach
router.post('/packages', protect, createPackage); // Coach adds package

module.exports = router;
