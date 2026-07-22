const express = require('express');
const router = express.Router({ mergeParams: true });
const { getAllReviews, createReview } = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /products/{productId}/reviews:
 *   get:
 *     summary: List reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of reviews }
 */
router.get('/', getAllReviews);

/**
 * @swagger
 * /products/{productId}/reviews:
 *   post:
 *     summary: Submit a review (buyer only, requires a delivered purchase)
 *     tags: [Reviews]
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
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               description: { type: string }
 *     responses:
 *       201: { description: Review created }
 *       403: { description: You can only review products you have purchased }
 *       409: { description: You have already reviewed this product }
 */
router.post('/', authenticate, authorize('buyer'), createReview);

module.exports = router;