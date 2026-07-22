const express = require('express');
const router = express.Router();
const { getMyAddresses, createAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const { authenticate } = require('../middleware/auth');

const meRouter = express.Router();
/**
 * @swagger
 * /users/me/addresses:
 *   get:
 *     summary: List the current user's addresses
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of addresses }
 */
meRouter.get('/', authenticate, getMyAddresses);

/**
 * @swagger
 * /users/me/addresses:
 *   post:
 *     summary: Add a new address
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressLine1, city, country]
 *             properties:
 *               title: { type: string }
 *               addressLine1: { type: string }
 *               addressLine2: { type: string }
 *               country: { type: string }
 *               city: { type: string }
 *               postalCode: { type: string }
 *               landmark: { type: string }
 *               phoneNumber: { type: string }
 *     responses:
 *       201: { description: Address created }
 *       400: { description: Missing required fields }
 */
meRouter.post('/', authenticate, createAddress);

/**
 * @swagger
 * /addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated address }
 *       403: { description: You do not own this address }
 *       404: { description: Address not found }
 */
router.put('/:id', authenticate, updateAddress);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Delete (soft-delete) an address
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Address deleted }
 *       403: { description: You do not own this address }
 *       404: { description: Address not found }
 */
router.delete('/:id', authenticate, deleteAddress);

module.exports = { meRouter, router };