const express = require('express');
const router = express.Router({ mergeParams: true });
const { createPayment, getPayment } = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /orders/{orderId}/payment:
 *   post:
 *     summary: Process payment for an order (simulated, buyer only)
 *     tags: [Payment]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider]
 *             properties:
 *               provider: { type: string, example: GCash }
 *     responses:
 *       201: { description: Payment recorded }
 *       409: { description: This order has already been paid for }
 */
router.post('/', authenticate, authorize('buyer'), createPayment);

/**
 * @swagger
 * /orders/{orderId}/payment:
 *   get:
 *     summary: View payment status for an order (buyer or involved seller)
 *     tags: [Payment]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Payment detail }
 *       403: { description: You do not have access to this payment }
 *       404: { description: No payment found for this order }
 */
router.get('/', authenticate, getPayment);

module.exports = router;