const express = require('express');
const {
    getSponsors,
    getSponsor,
    createSponsor,
    updateSponsor,
    deleteSponsor
} = require('./sponsor.controller');
const { protect, authorize } = require('../../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Adjust destination as needed

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sponsors
 *   description: Sponsor management
 */

/**
 * @swagger
 * /sponsors:
 *   get:
 *     summary: Get all active sponsors
 *     tags: [Sponsors]
 *     responses:
 *       200:
 *         description: List of sponsors
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
 *             required:
 *               - name
 *               - link
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               link:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Sponsor created
 */
router.route('/')
    .get(getSponsors)
    .post(protect, authorize('admin'), upload.single('image'), createSponsor);

/**
 * @swagger
 * /sponsors/{id}:
 *   get:
 *     summary: Get a single sponsor
 *     tags: [Sponsors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sponsor details
 *       404:
 *         description: Sponsor not found
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
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               link:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Sponsor updated
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
 *           type: integer
 *     responses:
 *       200:
 *         description: Sponsor deleted
 */
router.route('/:id')
    .get(getSponsor)
    .put(protect, authorize('admin'), upload.single('image'), updateSponsor)
    .delete(protect, authorize('admin'), deleteSponsor);

module.exports = router;
