const prisma = require('../config/prisma');

async function getAllProducts(req, res, next) {
  try {
    const { category, search, store, minPrice, maxPrice } = req.query;

    const where = {
      deletedAt: null,
    };

    if (category) {
      where.categoryId = Number(category);
    }

    if (store) {
      where.storeId = Number(store);
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.skus = {
        some: {
          price: {
            ...(minPrice && { gte: Number(minPrice) }),
            ...(maxPrice && { lte: Number(maxPrice) }),
          },
        },
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        skus: true,
        category: true,
        store: { select: { id: true, name: true } },
      },
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        skus: { include: { skuVariants: { include: { productVariant: true } } } },
        variants: true,
        category: true,
        store: { select: { id: true, name: true } },
      },
    });

    if (!product || product.deletedAt) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, description, cover, categoryId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const store = await prisma.store.findUnique({
      where: { sellerId: req.user.userId },
    });

    if (!store) {
      return res.status(400).json({ error: 'You must create a store before adding products' });
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: categoryId ? Number(categoryId) : null,
        name,
        description,
        cover,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { store: true },
    });

    if (!product || product.deletedAt) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.store.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this product' });
    }

    const { name, description, cover, categoryId } = req.body;

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(cover !== undefined && { cover }),
        ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { store: true },
    });

    if (!product || product.deletedAt) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.store.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this product' });
    }

    await prisma.product.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function getStoreProducts(req, res, next) {
  try {
    const { storeId } = req.params;

    const products = await prisma.product.findMany({
      where: { storeId: Number(storeId), deletedAt: null },
      include: { skus: true, category: true },
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getStoreProducts,
};