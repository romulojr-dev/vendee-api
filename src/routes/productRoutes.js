const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Browse all products, with optional filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: store
 *         schema: { type: integer }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *     responses:
 *       200: { description: List of products }
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product with its variants and SKUs
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Product detail }
 *       404: { description: Product not found }
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a product (seller only, tied to your own store)
 *     tags: [Products]
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
 *               cover: { type: string }
 *               categoryId: { type: integer }
 *     responses:
 *       201: { description: Product created }
 *       400: { description: You must create a store before adding products }
 */
router.post('/', authenticate, authorize('seller'), createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (owning seller only)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated product }
 *       403: { description: You do not own this product }
 *       404: { description: Product not found }
 */
router.put('/:id', authenticate, authorize('seller'), updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (owning seller only)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Product deleted }
 *       403: { description: You do not own this product }
 *       404: { description: Product not found }
 */
router.delete('/:id', authenticate, authorize('seller'), deleteProduct);

module.exports = router;