const express = require('express');
const {
    updateConfig,
    getAnalysis,
    createCategory,
    updateCategory,
    deleteCategory,
    getConfig,
    getCategories,
    getBookingStatuses,
    createBookingStatus,
    updateBookingStatus,
    deleteBookingStatus,
    uploadLogo
} = require('./settings.controller');
const { protect, authorize } = require('../../../middleware/auth');
const { upload, convertImage } = require('../../../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));


router.route('/config')
    .get(getConfig)
    .put(updateConfig);

router.post('/config/logo', upload.single('logo'), convertImage, uploadLogo);

router.get('/analysis', getAnalysis);

router.route('/categories')
    .get(getCategories)
    .post(createCategory);

router.route('/categories/:id')
    .put(updateCategory)
    .delete(deleteCategory);

router.route('/booking-statuses')
    .get(getBookingStatuses)
    .post(createBookingStatus);

router.route('/booking-statuses/:id')
    .put(updateBookingStatus)
    .delete(deleteBookingStatus);

module.exports = router;
