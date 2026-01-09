/**
 * @swagger
 * tags:
 *   name: Bookings Public
 *   description: Public bookings information
 */

/**
 * @swagger
 * /api/bookings/public:
 *   get:
 *     summary: Get all public bookings
 *     tags: [Bookings Public]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of public bookings
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/bookings/free-slots:
 *   get:
 *     summary: Get free slots
 *     tags: [Bookings Public]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of free slots
 *       400:
 *         description: Bad request
 */
