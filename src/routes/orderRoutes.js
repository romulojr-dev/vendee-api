const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Checkout — create an order from the current cart
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressId]
 *             properties:
 *               addressId: { type: integer }
 *     responses:
 *       201: { description: Order created }
 *       400: { description: Cart is empty, invalid address, or insufficient stock }
 */
router.post('/', authenticate, authorize('buyer'), createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: View the current buyer's order history
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of orders }
 */
router.get('/', authenticate, authorize('buyer'), getOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: View a specific order's detail (buyer or involved seller only)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Order detail }
 *       403: { description: You do not have access to this order }
 *       404: { description: Order not found }
 */
router.get('/:id', authenticate, getOrder);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order (buyer only, only while pending)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Order cancelled, stock restored }
 *       400: { description: Only pending orders can be cancelled }
 *       403: { description: You do not own this order }
 */
router.put('/:id/cancel', authenticate, authorize('buyer'), cancelOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update an order's status (seller only)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, shipped, delivered, cancelled] }
 *     responses:
 *       200: { description: Updated order status }
 *       403: { description: You do not have permission to update this order }
 */
router.put('/:id/status', authenticate, authorize('seller'), updateOrderStatus);

module.exports = router;