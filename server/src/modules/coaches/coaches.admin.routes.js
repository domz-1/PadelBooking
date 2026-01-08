const express = require('express');
const { deleteCoach, deletePackage, adminCreatePackage, updatePackage } = require('./coach.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Coaches (Admin)
 */

/**
 * @swagger
 * /admin/coaches/{id}:
 *   delete:
 *     summary: Delete coach profile
 *     tags: [Coaches (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Coach deleted
 */
router.delete('/:id', deleteCoach);

/**
 * @swagger
 * /admin/coaches/packages/{id}:
 *   delete:
 *     summary: Delete coach package
 *     tags: [Coaches (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Package deleted
 */
router.delete('/packages/:id', deletePackage);
router.post('/packages', adminCreatePackage);
router.put('/packages/:id', updatePackage);

module.exports = router;
