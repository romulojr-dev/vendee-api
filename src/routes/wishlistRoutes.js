const express = require('express');
const { getWishlist, createWishlist, deleteWishlist} = require('../controllers/wishlistController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /users/me/wishlist:
 *   get:
 *     summary: View the current buyer's wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of wishlist items }
 */
router.get('/', authenticate, authorize('buyer'), getWishlist);

/**
 * @swagger
 * /users/me/wishlist:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: integer }
 *     responses:
 *       201: { description: Added to wishlist }
 *       404: { description: Product not found }
 *       409: { description: Product already in your wishlist }
 */
router.post('/', authenticate, authorize('buyer'), createWishlist);

/**
 * @swagger
 * /users/me/wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from the wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Removed from wishlist }
 *       404: { description: Wishlist item not found }
 */
router.delete('/:productId', authenticate, authorize('buyer'), deleteWishlist);

module.exports = router;