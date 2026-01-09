const express = require('express');
const router = express.Router();
const branchController = require('./branch.controller');

require('./docs/client.swagger.js');

router.get('/', branchController.getAllBranches);
router.get('/:id', branchController.getBranchById);

module.exports = router;

