/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Application settings and configuration
 */

/**
 * @swagger
 * /api/settings/config:
 *   get:
 *     summary: Get global configuration
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Global configuration
 */

/**
 * @swagger
 * /api/settings/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: A list of categories
 */

/**
 * @swagger
 * /api/settings/booking-statuses:
 *   get:
 *     summary: Get all booking statuses
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: A list of booking statuses
 */

/**
 * @swagger
 * /admin/settings/config:
 *   get:
 *     summary: Get global configuration (admin)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global configuration
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/settings/config:
 *   put:
 *     summary: Update global configuration
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/settings/config/logo:
 *   post:
 *     summary: Upload a new logo
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/settings/analysis:
 *   get:
 *     summary: Get application analysis
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application analysis
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/settings/categories:
 *   get:
 *     summary: Get all categories (admin)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of categories
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/settings/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Settings]
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
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/settings/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Settings]
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
 *         description: Category updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /admin/settings/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Settings]
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
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /admin/settings/booking-statuses:
 *   get:
 *     summary: Get all booking statuses (admin)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of booking statuses
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/settings/booking-statuses:
 *   post:
 *     summary: Create a new booking status
 *     tags: [Settings]
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
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking status created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/settings/booking-statuses/{id}:
 *   put:
 *     summary: Update a booking status
 *     tags: [Settings]
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
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking status not found
 */

/**
 * @swagger
 * /admin/settings/booking-statuses/{id}:
 *   delete:
 *     summary: Delete a booking status
 *     tags: [Settings]
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
 *         description: Booking status deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking status not found
 */
