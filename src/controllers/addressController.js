const prisma = require('../config/prisma');

async function getMyAddresses(req, res, next) {
  try {
    const addresses = await prisma.address.findMany({
      where: {
        userId: req.user.userId,
        deletedAt: null,
      },
    });

    res.json(addresses);
  } catch (error) {
    next(error);
  }
}

async function createAddress(req, res, next) {
  try {
    const {
      title,
      addressLine1,
      addressLine2,
      country,
      city,
      postalCode,
      landmark,
      phoneNumber,
    } = req.body;

    if (!addressLine1 || !city || !country) {
      return res.status(400).json({ error: 'Address line 1, city, and country are required' });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.userId,
        title,
        addressLine1,
        addressLine2,
        country,
        city,
        postalCode,
        landmark,
        phoneNumber,
      },
    });

    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
}

async function updateAddress(req, res, next) {
  try {
    const { id } = req.params;

    const address = await prisma.address.findUnique({
      where: { id: Number(id) },
    });

    if (!address || address.deletedAt) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (address.userId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this address' });
    }

    const {
      title,
      addressLine1,
      addressLine2,
      country,
      city,
      postalCode,
      landmark,
      phoneNumber,
    } = req.body;

    const updated = await prisma.address.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(addressLine1 !== undefined && { addressLine1 }),
        ...(addressLine2 !== undefined && { addressLine2 }),
        ...(country !== undefined && { country }),
        ...(city !== undefined && { city }),
        ...(postalCode !== undefined && { postalCode }),
        ...(landmark !== undefined && { landmark }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteAddress(req, res, next) {
  try {
    const { id } = req.params;

    const address = await prisma.address.findUnique({
      where: { id: Number(id) },
    });

    if (!address || address.deletedAt) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (address.userId !== req.user.userId) {
      return res.status(403).json({ error: 'You do not own this address' });
    }

    await prisma.address.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { getMyAddresses, createAddress, updateAddress, deleteAddress };