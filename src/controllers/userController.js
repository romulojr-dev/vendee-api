const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const { firstName, lastName, avatar, phoneNumber, dateOfBirth, password } = req.body;

    const dataToUpdate = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(avatar !== undefined && { avatar }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: dataToUpdate,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
}

async function deactivateMe(req, res, next) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password confirmation is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { getMe, updateMe, deactivateMe };