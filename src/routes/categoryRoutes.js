const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     responses:
 *       200: { description: List of categories }
 */
router.get('/', getAllCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a category (seller only)
 *     tags: [Categories]
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
 *       201: { description: Category created }
 *       409: { description: Category already exists }
 */
router.post('/', authenticate, authorize('seller'), createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category (seller only)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated category }
 *       404: { description: Category not found }
 */
router.put('/:id', authenticate, authorize('seller'), updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category (seller only)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Category deleted }
 *       404: { description: Category not found }
 */
router.delete('/:id', authenticate, authorize('seller'), deleteCategory);

module.exports = router;