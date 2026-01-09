const express = require('express');
const {
    getProducts,
    createProduct,
    updateProduct,
    bulkImportProducts,
    deleteProduct,
    getAllOrders,
    updateOrderStatus,
    getCategories,
    createCategory,
    updateCategory
} = require('./store.controller');
const { protect, authorize } = require('../../../middleware/auth');
const { upload, convertImage } = require('../../../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// Product Routes
router.get('/products', getProducts);
router.post('/products', upload.single('image'), convertImage, createProduct);
router.post('/products/import', upload.single('file'), bulkImportProducts);
router.route('/products/:id')
    .put(upload.single('image'), convertImage, updateProduct)
    .delete(deleteProduct);

// Category Routes
router.route('/categories')
    .get(getCategories)
    .post(upload.single('image'), convertImage, createCategory);

router.route('/categories/:id')
    .put(upload.single('image'), convertImage, updateCategory);

// Order Routes
router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);

module.exports = router;
