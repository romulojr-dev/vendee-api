const express = require('express');
const router = express.Router();
const { createStore, getStore, updateStore } = require('../controllers/storeController');
const { getStoreProducts } = require('../controllers/productController');
const { getStoreOrders } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /stores:
 *   post:
 *     summary: Create a store (seller only)
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: Store created }
 *       409: { description: You already have a store }
 */
router.post('/', authenticate, authorize('seller'), createStore);

/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Get a store's public profile
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Store profile }
 *       404: { description: Store not found }
 */
router.get('/:id', getStore);

/**
 * @swagger
 * /stores/{id}:
 *   put:
 *     summary: Update a store (owning seller only)
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated store }
 *       403: { description: You do not own this store }
 *       404: { description: Store not found }
 */
router.put('/:id', authenticate, authorize('seller'), updateStore);

/**
 * @swagger
 * /stores/{storeId}/products:
 *   get:
 *     summary: List all products from a specific store
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of products }
 */
router.get('/:storeId/products', getStoreProducts);

/**
 * @swagger
 * /stores/{storeId}/orders:
 *   get:
 *     summary: View orders received for own store (seller only)
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of orders }
 *       403: { description: You do not have access to this store }
 */
router.get('/:storeId/orders', authenticate, authorize('seller'), getStoreOrders);

module.exports = router;