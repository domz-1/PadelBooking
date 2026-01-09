const express = require('express');
const { deleteCoach, deletePackage, adminCreatePackage, updatePackage } = require('./coach.controller');
const { protect, authorize } = require('../../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));


router.delete('/:id', deleteCoach);

router.delete('/packages/:id', deletePackage);
router.post('/packages', adminCreatePackage);
router.put('/packages/:id', updatePackage);

module.exports = router;
