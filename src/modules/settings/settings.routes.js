const express = require('express');
const {
    getConfig, updateConfig,
    getCategories, createCategory, updateCategory, deleteCategory
} = require('./settings.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Config Routes
router.get('/config', getConfig);
router.put('/config', protect, authorize('admin'), updateConfig);

// Analysis Route
router.get('/analysis', protect, authorize('admin'), require('./settings.controller').getAnalysis);

// Category Routes
router.route('/categories')
    .get(getCategories)
    .post(protect, authorize('admin'), createCategory);

router.route('/categories/:id')
    .put(protect, authorize('admin'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
