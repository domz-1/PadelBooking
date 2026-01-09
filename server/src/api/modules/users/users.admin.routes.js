const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, getProfile, banUser } = require('./user.controller');
const { protect, authorize } = require('../../../middleware/auth');
const { upload, convertImage } = require('../../../middleware/upload');
const router = express.Router();

// Apply protection to all admin routes
router.use(protect);
router.use(authorize('admin'));


router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getProfile)
    .put(upload.single('image'), convertImage, updateUser)
    .delete(deleteUser);

router.patch('/:id/ban', banUser);

module.exports = router;
