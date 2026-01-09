const express = require('express');
const { createSport, updateSport, deleteSport, getSports, getSport } = require('./sport.controller');
const { protect, authorize } = require('../../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));


router.route('/')
    .get(getSports)
    .post(createSport);

router.route('/:id')
    .get(getSport)
    .put(updateSport)
    .delete(deleteSport);

module.exports = router;
