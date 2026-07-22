const prisma = require('../config/prisma');

async function getAllReviews(req, res, next) {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product || product.deletedAt) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviews = await prisma.review.findMany({
      where: { productId: Number(productId) },
    });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
}

async function createReview(req, res, next) {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product || product.deletedAt) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId: Number(productId),
        order: {
          buyerId: req.user.userId,
          status: 'delivered'
        },
      }
    });

    if (!purchase) {
      return res.status(403).json({ error: 'You can only review products you have purchased' });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        productId: Number(productId),
        userId: req.user.userId,
      },
    });

    if (existingReview) {
      return res.status(409).json({ error: 'You have already reviewed this product' });
    }

    const { rating, description } = req.body;

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    const review = await prisma.review.create({
      data: {
        productId: Number(productId),
        userId: req.user.userId,
        rating,
        description,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllReviews, createReview };