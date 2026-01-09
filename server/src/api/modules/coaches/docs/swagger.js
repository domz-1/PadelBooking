/**
 * @swagger
 * tags:
 *   name: Coaches
 *   description: Coach and package management
 */

/**
 * @swagger
 * /api/coaches:
 *   get:
 *     summary: Get all coaches
 *     tags: [Coaches]
 *     responses:
 *       200:
 *         description: A list of coaches
 */

/**
 * @swagger
 * /api/coaches/profile:
 *   post:
 *     summary: Create a coach profile
 *     tags: [Coaches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               bio:
 *                 type: string
 *               experience:
 *                 type: string
 *     responses:
 *       201:
 *         description: Coach profile created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/coaches/packages:
 *   post:
 *     summary: Create a new package
 *     tags: [Coaches]
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
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               sessions:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Package created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/coaches/{id}:
 *   delete:
 *     summary: Delete a coach
 *     tags: [Coaches]
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
 *         description: Coach deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coach not found
 */

/**
 * @swagger
 * /admin/coaches/packages/{id}:
 *   delete:
 *     summary: Delete a package
 *     tags: [Coaches]
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
 *         description: Package deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Package not found
 */

/**
 * @swagger
 * /admin/coaches/packages:
 *   post:
 *     summary: Create a new package (admin)
 *     tags: [Coaches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coachId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               sessions:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Package created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/coaches/packages/{id}:
 *   put:
 *     summary: Update a package
 *     tags: [Coaches]
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
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               sessions:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Package updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Package not found
 */
