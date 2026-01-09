/**
 * @swagger
 * tags:
 *   name: Branches Admin
 *   description: Branches management for admins
 */

/**
 * @swagger
 * /api/admin/branches:
 *   get:
 *     summary: Get all branches
 *     tags: [Branches Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of branches
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/admin/branches/{id}:
 *   get:
 *     summary: Get a single branch
 *     tags: [Branches Admin]
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
 *         description: A single branch
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Branch not found
 */

/**
 * @swagger
 * /api/admin/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches Admin]
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
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/admin/branches/{id}:
 *   put:
 *     summary: Update a branch
 *     tags: [Branches Admin]
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
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Branch not found
 */

/**
 * @swagger
 * /api/admin/branches/{id}:
 *   delete:
 *     summary: Delete a branch
 *     tags: [Branches Admin]
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
 *         description: Branch deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Branch not found
 */
