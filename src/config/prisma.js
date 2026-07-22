const { PrismaClient } = require('@prisma/client');
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

const prisma = new PrismaClient();

module.exports = prisma;