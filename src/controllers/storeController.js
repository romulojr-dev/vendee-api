const prisma = require('../config/prisma');

async function createStore(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Store name is required' });
    }

    const existingStore = await prisma.store.findUnique({
      where: { sellerId: req.user.userId },
    });

    if (existingStore) {
      return res.status(409).json({ error: 'You already have a store' });
    }

    const store = await prisma.store.create({
      data: {
        sellerId: req.user.userId,
        name,
        description,
      },
    });

    res.status(201).json(store);
  } catch (error) {
    next(error);
  }
}

async function getStore(req, res, next) {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id: Number(id) },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    next(error);
  }
}

async function updateStore(req, res, next) {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id: Number(id) },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (store.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this store' });
    }

    const { name, description } = req.body;

    const updatedStore = await prisma.store.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    res.json(updatedStore);
  } catch (error) {
    next(error);
  }
}

module.exports = { createStore, getStore, updateStore };