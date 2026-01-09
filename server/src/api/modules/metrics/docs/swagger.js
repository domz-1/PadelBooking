/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: Metrics and statistics
 */

/**
 * @swagger
 * /admin/metrics/stats:
 *   get:
 *     summary: Get dashboard stats
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/metrics/available-slots:
 *   get:
 *     summary: Get available slots
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: requestedStartTime
 *         schema:
 *           type: string
 *       - in: query
 *         name: requestedEndTime
 *         schema:
 *           type: string
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of available slots
 *       401:
 *         description: Unauthorized
 */
