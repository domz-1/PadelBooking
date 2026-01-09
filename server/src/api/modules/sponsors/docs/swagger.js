/**
 * @swagger
 * tags:
 *   name: Sponsors
 *   description: Sponsor management
 */

/**
 * @swagger
 * /api/sponsors:
 *   get:
 *     summary: Get all active sponsors
 *     tags: [Sponsors]
 *     responses:
 *       200:
 *         description: A list of active sponsors
 */

/**
 * @swagger
 * /api/sponsors/{id}:
 *   get:
 *     summary: Get a single sponsor
 *     tags: [Sponsors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single sponsor
 *       404:
 *         description: Sponsor not found
 */

/**
 * @swagger
 * /admin/sponsors:
 *   get:
 *     summary: Get all sponsors (admin)
 *     tags: [Sponsors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all sponsors
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/sponsors:
 *   post:
 *     summary: Create a new sponsor
 *     tags: [Sponsors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               link:
 *                 type: string
 *               showInHome:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Sponsor created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/sponsors/{id}:
 *   get:
 *     summary: Get a single sponsor (admin)
 *     tags: [Sponsors]
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
 *         description: A single sponsor
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sponsor not found
 */

/**
 * @swagger
 * /admin/sponsors/{id}:
 *   put:
 *     summary: Update a sponsor
 *     tags: [Sponsors]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               link:
 *                 type: string
 *               showInHome:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Sponsor updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sponsor not found
 */

/**
 * @swagger
 * /admin/sponsors/{id}:
 *   delete:
 *     summary: Delete a sponsor
 *     tags: [Sponsors]
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
 *         description: Sponsor deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sponsor not found
 */
