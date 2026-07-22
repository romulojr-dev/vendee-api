const prisma = require('../config/prisma');

async function getCart(req, res, next) {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: {
            product: true,
            productSku: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.userId },
        include: {
          items: {
            include: {
              product: true,
              productSku: true,
            },
          },
        },
      });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function addToCart(req, res, next) {
  try {
    const { productId, productSkuId, quantity } = req.body;

    if (!productId || !productSkuId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const productSku = await prisma.productSku.findUnique({
      where: { id: Number(productSkuId) },
    });

    if (!productSku || productSku.deletedAt) {
      return res.status(404).json({ error: 'Product SKU not found' });
    }

    if (productSku.quantity < Number(quantity)) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.userId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productSkuId: Number(productSkuId),
      },
    });

    let cartItem;

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + Number(quantity) },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: Number(productId),
          productSkuId: Number(productSkuId),
          quantity: Number(quantity),
        },
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({ error: 'A valid quantity is required' });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: Number(id) },
      include: { cart: true, productSku: true },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.cart.userId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this cart item' });
    }

    if (cartItem.productSku.quantity < Number(quantity)) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    const updated = await prisma.cartItem.update({
      where: { id: Number(id) },
      data: { quantity: Number(quantity) },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function removeCartItem(req, res, next) {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: Number(id) },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.cart.userId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this cart item' });
    }

    await prisma.cartItem.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };