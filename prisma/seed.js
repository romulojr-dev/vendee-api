const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const seller = await prisma.user.create({
    data: {
      username: 'demoseller',
      email: 'seller@vendee.com',
      password: hashedPassword,
      role: 'seller',
    },
  });

  const store = await prisma.store.create({
    data: {
      sellerId: seller.id,
      name: 'Demo Shop',
      description: 'A sample store for testing',
    },
  });

  const category = await prisma.category.create({
    data: { name: 'Clothing', description: 'Apparel and accessories' },
  });

  const product1 = await prisma.product.create({
    data: {
      storeId: store.id,
      categoryId: category.id,
      name: 'Classic T-Shirt',
      description: 'A comfortable everyday t-shirt',
    },
  });

  await prisma.productSku.create({
    data: {
      productId: product1.id,
      sku: 'TSHIRT-001',
      price: 299,
      quantity: 50,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      storeId: store.id,
      categoryId: category.id,
      name: 'Denim Jacket',
      description: 'Stylish denim jacket for all seasons',
    },
  });

  await prisma.productSku.create({
    data: {
      productId: product2.id,
      sku: 'JACKET-001',
      price: 1499,
      quantity: 20,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });