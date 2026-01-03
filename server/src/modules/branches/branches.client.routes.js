const express = require('express');
const router = express.Router();
const branchController = require('./branch.controller');

/**
 * @swagger
 * tags:
 *   name: Branches (Client)
 *   description: Branch information for users
 */

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: Get all active branches
 *     tags: [Branches (Client)]
 *     responses:
 *       200:
 *         description: List of branches
 */
router.get('/', branchController.getAllBranches);

/**
 * @swagger
 * /api/branches/{id}:
 *   get:
 *     summary: Get a branch by ID
 *     tags: [Branches (Client)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Branch details
 *       404:
 *         description: Branch not found
 */
router.get('/:id', branchController.getBranchById);

module.exports = router;
