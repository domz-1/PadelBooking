const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, getProfile, banUser } = require('./user.controller');
const { protect, authorize } = require('../../middleware/auth');
const router = express.Router();

// Apply protection to all admin routes
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Users (Admin)
 *   description: User management for admins
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users (Admin)]
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create a new user
 *     tags: [Users (Admin)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.route('/')
    .get(getUsers)
    .post(createUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: User details
 *   put:
 *     summary: Update user
 *     tags: [Users (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete user
 *     tags: [Users (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: User deleted
 */
router.route('/:id')
    .get(getProfile)
    .put(updateUser)
    .delete(deleteUser);

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   patch:
 *     summary: Ban user (Set isActive to false)
 *     tags: [Users (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: User banned
 */
router.patch('/:id/ban', banUser);

module.exports = router;
