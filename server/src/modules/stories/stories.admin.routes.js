const express = require('express');
const { deleteStory } = require('./story.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Stories (Admin)
 */

/**
 * @swagger
 * /admin/stories/{id}:
 *   delete:
 *     summary: Delete story
 *     tags: [Stories (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Story deleted
 */
router.delete('/:id', deleteStory);

module.exports = router;
