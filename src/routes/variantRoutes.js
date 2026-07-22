const express = require('express');
const { createVariant, createSku, updateSku } = require('../controllers/variantController');
const { authenticate, authorize } = require('../middleware/auth');

const productRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * /products/{productId}/variants:
 *   post:
 *     summary: Add a variant to a product (owning seller only)
 *     tags: [Product Variants & SKUs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, value]
 *             properties:
 *               type: { type: string, enum: [color, size] }
 *               value: { type: string }
 *     responses:
 *       201: { description: Variant created }
 *       403: { description: You do not own this product }
 */
productRouter.post('/variants', authenticate, authorize('seller'), createVariant);

/**
 * @swagger
 * /products/{productId}/skus:
 *   post:
 *     summary: Create a SKU for a product (owning seller only)
 *     tags: [Product Variants & SKUs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sku, price, quantity]
 *             properties:
 *               sku: { type: string }
 *               price: { type: number }
 *               quantity: { type: integer }
 *     responses:
 *       201: { description: SKU created }
 *       403: { description: You do not own this product }
 */
productRouter.post('/skus', authenticate, authorize('seller'), createSku);

const router = express.Router();

/**
 * @swagger
 * /skus/{id}:
 *   put:
 *     summary: Update a SKU's price or stock (owning seller only)
 *     tags: [Product Variants & SKUs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated SKU }
 *       403: { description: You do not own this sku }
 *       404: { description: Sku not found }
 */
router.put('/:id', authenticate, authorize('seller'), updateSku);

module.exports = { productRouter, router };