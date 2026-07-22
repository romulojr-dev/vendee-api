const prisma = require('../config/prisma');

async function createPayment(req, res, next) {
  try {
    const { orderId } = req.params;
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'Payment provider is required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.buyerId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this order' });
    }

    const existingPayment = await prisma.paymentDetail.findUnique({
      where: { orderId: Number(orderId) },
    });

    if (existingPayment) {
      return res.status(409).json({ error: 'This order has already been paid for' });
    }

    // Simulated processing — no real payment gateway involved.
    // Always succeeds for now; could randomly simulate failure later if desired.
    const payment = await prisma.paymentDetail.create({
      data: {
        orderId: Number(orderId),
        amount: order.total,
        provider,
        status: 'completed',
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
}

async function getPayment(req, res, next) {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { items: { include: { product: { include: { store: true } } } } },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isBuyer = order.buyerId === req.user.userId;
    const isSeller = order.items.some(
      (item) => item.product.store.sellerId === req.user.userId
    );

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'You do not have access to this payment' });
    }

    const payment = await prisma.paymentDetail.findUnique({
      where: { orderId: Number(orderId) },
    });

    if (!payment) {
      return res.status(404).json({ error: 'No payment found for this order' });
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
}

module.exports = { createPayment, getPayment };