const prisma = require('../config/prisma');

async function getWishlist(req, res, next) {
  try {
    const wishlists = await prisma.wishlist.findMany({
      where: {
        userId: req.user.userId,
        deletedAt: null,
      },
      include: { 
        product: { include: { skus: true } },
      },
    });

    res.json(wishlists);
  } catch (error) {
    next(error);
  }
}

async function createWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });

    if (!product || product.deletedAt) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = await prisma.wishlist.findFirst({
      where: { userId: req.user.userId, productId: Number(productId) },
    });

    if (existing) {
      return res.status(409).json({ error: 'Product already in your wishlist' });
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId: req.user.userId,
        productId: Number(productId),
      },
    });

    res.status(201).json(wishlist);
  } catch (error) {
    next(error);
  }
}

async function deleteWishlist(req, res, next) {
  try {
    const { productId } = req.params;

    const wishlist = await prisma.wishlist.findFirst({
      where: {
        userId: req.user.userId,
        productId: Number(productId),
      },
    });

    if (!wishlist || wishlist.deletedAt) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    await prisma.wishlist.delete({
      where: { id: wishlist.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { getWishlist, createWishlist, deleteWishlist };