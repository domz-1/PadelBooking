const express = require('express');
const { updateProfile, updatePassword, findPartners, getProfile } = require('./user.controller');
const { protect } = require('../../../middleware/auth');
const { upload, convertImage } = require('../../../middleware/upload');
const router = express.Router();

// Apply protection to all client routes
router.use(protect);


router.put('/profile', upload.single('image'), convertImage, updateProfile);

router.put('/password', updatePassword);

router.get('/partners', findPartners);

router.get('/:id', getProfile);

module.exports = router;
