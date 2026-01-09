const express = require('express');
const { getProducts, createOrder, getMyOrders, getCategories } = require('./store.controller');
const { protect } = require('../../../middleware/auth');

const router = express.Router();


router.get('/products', getProducts);
router.get('/categories', getCategories);

router.use(protect);

router.route('/orders')
    .post(createOrder)
    .get(getMyOrders);

module.exports = router;
