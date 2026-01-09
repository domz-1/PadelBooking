/**
 * @swagger
 * tags:
 *   name: Sports
 *   description: Sport management
 */

/**
 * @swagger
 * /api/sports:
 *   get:
 *     summary: Get all sports
 *     tags: [Sports]
 *     responses:
 *       200:
 *         description: A list of sports
 */

/**
 * @swagger
 * /api/sports/{id}:
 *   get:
 *     summary: Get a single sport
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single sport
 *       404:
 *         description: Sport not found
 */

/**
 * @swagger
 * /admin/sports:
 *   get:
 *     summary: Get all sports (admin)
 *     tags: [Sports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all sports
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/sports:
 *   post:
 *     summary: Create a new sport
 *     tags: [Sports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sport created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/sports/{id}:
 *   get:
 *     summary: Get a single sport (admin)
 *     tags: [Sports]
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
 *         description: A single sport
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sport not found
 */

/**
 * @swagger
 * /admin/sports/{id}:
 *   put:
 *     summary: Update a sport
 *     tags: [Sports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sport updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sport not found
 */

/**
 * @swagger
 * /admin/sports/{id}:
 *   delete:
 *     summary: Delete a sport
 *     tags: [Sports]
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
 *         description: Sport deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sport not found
 */
