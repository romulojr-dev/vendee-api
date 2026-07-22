const prisma = require('../config/prisma');

async function getAllCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const existing = await prisma.category.findUnique({ where: { name } });

    if (existing) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: { name, description },
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await prisma.category.findUnique({ where: { id: Number(id) } });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({ where: { id: Number(id) } });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await prisma.category.delete({ where: { id: Number(id) } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };