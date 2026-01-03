const express = require('express');
const router = express.Router();
const branchController = require('./branch.controller');
const { protect, authorize } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Branches (Admin)
 *   description: Branch management for admins
 */

/**
 * @swagger
 * /admin/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', protect, authorize('admin', 'super-admin'), branchController.createBranch);

/**
 * @swagger
 * /admin/branches:
 *   get:
 *     summary: Get all branches
 *     tags: [Branches (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of branches
 */
router.get('/', protect, authorize('admin', 'super-admin'), branchController.getAllBranches);

/**
 * @swagger
 * /admin/branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     tags: [Branches (Admin)]
 *     security:
 *       - bearerAuth: []
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
router.get('/:id', protect, authorize('admin', 'super-admin'), branchController.getBranchById);

/**
 * @swagger
 * /admin/branches/{id}:
 *   put:
 *     summary: Update a branch
 *     tags: [Branches (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       404:
 *         description: Branch not found
 */
router.put('/:id', protect, authorize('admin', 'super-admin'), branchController.updateBranch);

/**
 * @swagger
 * /admin/branches/{id}:
 *   delete:
 *     summary: Delete a branch
 *     tags: [Branches (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       404:
 *         description: Branch not found
 */
router.delete('/:id', protect, authorize('admin', 'super-admin'), branchController.deleteBranch);

module.exports = router;
