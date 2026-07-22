const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: View the current buyer's cart (auto-created if none exists)
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: The cart with its items }
 */
router.get('/', authenticate, authorize('buyer'), getCart);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add an item to the cart (merges quantity if SKU already present)
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, productSkuId, quantity]
 *             properties:
 *               productId: { type: integer }
 *               productSkuId: { type: integer }
 *               quantity: { type: integer }
 *     responses:
 *       201: { description: Item added to cart }
 *       400: { description: Not enough stock available }
 */
router.post('/items', authenticate, authorize('buyer'), addToCart);

/**
 * @swagger
 * /cart/items/{id}:
 *   put:
 *     summary: Update a cart item's quantity
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated cart item }
 *       403: { description: You do not own this cart item }
 *       404: { description: Cart item not found }
 */
router.put('/items/:id', authenticate, authorize('buyer'), updateCartItem);

/**
 * @swagger
 * /cart/items/{id}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Item removed }
 *       403: { description: You do not own this cart item }
 *       404: { description: Cart item not found }
 */
router.delete('/items/:id', authenticate, authorize('buyer'), removeCartItem);

module.exports = router;