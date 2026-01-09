/**
 * @swagger
 * tags:
 *   name: Stories
 *   description: Story management
 */

/**
 * @swagger
 * /api/stories:
 *   get:
 *     summary: Get all active stories
 *     tags: [Stories]
 *     responses:
 *       200:
 *         description: A list of active stories
 */

/**
 * @swagger
 * /api/stories:
 *   post:
 *     summary: Create a new story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mediaUrl:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *     responses:
 *       201:
 *         description: Story created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/stories/{id}:
 *   delete:
 *     summary: Delete a story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Story deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Story not found
 */
