/**
 * @swagger
 * tags:
 *   name: Branches Client
 *   description: Branches information for clients
 */

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: Get all branches
 *     tags: [Branches Client]
 *     responses:
 *       200:
 *         description: A list of branches
 */

/**
 * @swagger
 * /api/branches/{id}:
 *   get:
 *     summary: Get a single branch
 *     tags: [Branches Client]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single branch
 *       404:
 *         description: Branch not found
 */
