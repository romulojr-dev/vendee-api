const express = require('express');
const router = express.Router();
const { getMe, updateMe, deactivateMe } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: The current user's profile }
 *       401: { description: No token provided or invalid token }
 *       404: { description: User not found }
 */
router.get('/me', authenticate, getMe);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update the current user's profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               avatar: { type: string }
 *               phoneNumber: { type: string }
 *               dateOfBirth: { type: string, format: date }
 *               password: { type: string }
 *     responses:
 *       200: { description: Updated profile }
 *       401: { description: No token provided or invalid token }
 */
router.put('/me', authenticate, updateMe);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Deactivate (soft-delete) the current user's account
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, description: Confirm password to deactivate }
 *     responses:
 *       204: { description: Account deactivated }
 *       400: { description: Password confirmation required }
 *       401: { description: Incorrect password }
 */
router.delete('/me', authenticate, deactivateMe);

module.exports = router;