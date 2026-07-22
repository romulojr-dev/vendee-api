const prisma = require('../config/prisma');

async function createVariant(req, res, next) {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { store: true },
    });

    if (!product || product.deletedAt) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.store.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this product' });
    }

    const { type, value } = req.body;
    
    if (!type || !value) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['color', 'size'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "color" or "size"' });
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId: Number(productId),
        type,
        value,
      },
    });

    res.status(201).json(variant);
  } catch (error) {
    next(error);
  }
}

async function createSku(req, res, next) {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { store: true },
    });

    if (!product || product.deletedAt) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.store.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this product' });
    }

    const { sku, price, quantity } = req.body;

    if (!sku || !price || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if(isNaN(price) || isNaN(quantity)){
      return res.status(400).json({ error: 'Provide a valid number'});
    }

    const productSku = await prisma.productSku.create({
      data: {
        productId: Number(productId),
        sku,
        price: Number(price),
        quantity: Number(quantity),
      }
    });

    res.status(201).json(productSku);
  } catch (error) {
    next(error);
  }
}

async function updateSku(req, res, next) {
  try {
    const { id } = req.params;

    const productSku = await prisma.productSku.findUnique({
      where: { id: Number(id) },
      include: { product: { include: { store: true } } },
    });

    if (!productSku || productSku.deletedAt) {
      return res.status(404).json({ error: 'Product Sku not found' });
    }

    if (productSku.product.store.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this sku' });
    }

    const { sku, price, quantity } = req.body;

    if(isNaN(price) || isNaN(quantity)){
      return res.status(400).json({ error: 'Provide a valid number'});
    }

    const updated = await prisma.productSku.update({
      where: {id: Number(id) },
      data: {
        ...(sku !== undefined && { sku }),
        ...(price !== undefined && { price: Number(price) }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

module.exports = { createVariant, createSku, updateSku };