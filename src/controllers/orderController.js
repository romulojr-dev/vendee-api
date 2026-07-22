const prisma = require('../config/prisma');

async function createOrder(req, res, next) {
  try {
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const address = await prisma.address.findUnique({
      where: { id: Number(addressId) },
    });

    if (!address || address.userId !== req.user.userId) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: { productSku: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    for (const item of cart.items) {
      if (item.productSku.quantity < item.quantity) {
        return res.status(400).json({
          error: `Not enough stock for SKU ${item.productSku.sku}`,
        });
      }
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + Number(item.productSku.price) * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: req.user.userId,
          addressId: Number(addressId),
          total,
          status: 'pending',
        },
      });

      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productSkuId: item.productSkuId,
            quantity: item.quantity,
            priceAtPurchase: item.productSku.price,
          },
        });

        await tx.productSku.update({
          where: { id: item.productSkuId },
          data: { quantity: item.productSku.quantity - item.quantity },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user.userId },
      include: { items: true, address: true },
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: { include: { product: true, productSku: true } },
        address: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isBuyer = order.buyerId === req.user.userId;

    const isSeller = await prisma.orderItem.findFirst({
      where: {
        orderId: order.id,
        product: { store: { sellerId: req.user.userId } },
      },
    });

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'You do not have access to this order' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.buyerId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this order' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.productSku.update({
          where: { id: item.productSkuId },
          data: { quantity: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: { status: 'cancelled' },
      });
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: { include: { product: { include: { store: true } } } } },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const ownsOrder = order.items.some(
      (item) => item.product.store.sellerId === req.user.userId
    );

    if (!ownsOrder) {
      return res.status(403).json({ error: 'You do not have permission to update this order' });
    }

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function getStoreOrders(req, res, next) {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({
      where: { id: Number(storeId) },
    });

    if (!store || store.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not have access to this store' });
    }

    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { storeId: Number(storeId) },
          },
        },
      },
      include: { items: true },
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, getOrders, getOrder, cancelOrder, updateOrderStatus, getStoreOrders };