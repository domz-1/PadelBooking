const express = require('express');
const router = express.Router();
const branchController = require('./branch.controller');
const { protect, authorize } = require('../../../middleware/auth');
const { upload, convertImage } = require('../../../middleware/upload');

require('./docs/admin.swagger.js');

router.post('/', protect, authorize('admin', 'super-admin'), upload.array('images', 5), convertImage, branchController.createBranch);
router.get('/', protect, authorize('admin', 'super-admin'), branchController.getAllBranches);
router.get('/:id', protect, authorize('admin', 'super-admin'), branchController.getBranchById);
router.put('/:id', protect, authorize('admin', 'super-admin'), upload.array('images', 5), convertImage, branchController.updateBranch);
router.delete('/:id', protect, authorize('admin', 'super-admin'), branchController.deleteBranch);

module.exports = router;

