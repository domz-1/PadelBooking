const express = require('express');
const { createSponsor, updateSponsor, deleteSponsor, getSponsors, getSponsor } = require('./sponsor.controller');
const { protect, authorize } = require('../../middleware/auth');
const { upload, convertImage } = require('../../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Sponsors (Admin)
 */

/**
 * @swagger
 * /admin/sponsors:
 *   get:
 *     summary: Get all sponsors
 *     tags: [Sponsors (Admin)]
 *     responses:
 *       200:
 *         description: List of sponsors
 *   post:
 *     summary: Create a new sponsor
 *     tags: [Sponsors (Admin)]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Sponsor created
 */
router.route('/')
    .get(getSponsors)
    .post(upload.single('image'), convertImage, createSponsor);

/**
 * @swagger
 * /admin/sponsors/{id}:
 *   get:
 *     summary: Get sponsor by ID
 *     tags: [Sponsors (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Sponsor details
 *   put:
 *     summary: Update sponsor
 *     tags: [Sponsors (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Sponsor updated
 *   delete:
 *     summary: Delete sponsor
 *     tags: [Sponsors (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Sponsor deleted
 */
router.route('/:id')
    .get(getSponsor)
    .put(upload.single('image'), convertImage, updateSponsor)
    .delete(deleteSponsor);

module.exports = router;
