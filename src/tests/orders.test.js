const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');

describe('Orders (checkout flow)', () => {
  let buyerToken;
  let sellerToken;
  let addressId;
  let productSkuId;
  let orderId;

  beforeAll(async () => {
    // Register and log in a buyer
    await request(app).post('/api/auth/register').send({
      username: 'orderbuyer',
      email: 'orderbuyer@example.com',
      password: 'password123',
      role: 'buyer',
    });
    const buyerLogin = await request(app).post('/api/auth/login').send({
      email: 'orderbuyer@example.com',
      password: 'password123',
    });
    buyerToken = buyerLogin.body.token;

    // Register and log in a seller
    await request(app).post('/api/auth/register').send({
      username: 'orderseller',
      email: 'orderseller@example.com',
      password: 'password123',
      role: 'seller',
    });
    const sellerLogin = await request(app).post('/api/auth/login').send({
      email: 'orderseller@example.com',
      password: 'password123',
    });
    sellerToken = sellerLogin.body.token;

    // Seller creates a store and a product with a SKU
    const storeRes = await request(app)
      .post('/api/stores')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Order Test Shop' });

    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Test Mug' });

    const skuRes = await request(app)
      .post(`/api/products/${productRes.body.id}/skus`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ sku: 'MUG-001', price: 250, quantity: 10 });
    productSkuId = skuRes.body.id;

    // Buyer creates an address
    const addressRes = await request(app)
      .post('/api/users/me/addresses')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        addressLine1: '123 Test Street',
        city: 'Quezon City',
        country: 'Philippines',
      });
    addressId = addressRes.body.id;

    // Buyer adds the SKU to their cart
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        productId: productRes.body.id,
        productSkuId,
        quantity: 3,
      });
  });

  afterAll(async () => {
    await prisma.paymentDetail.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.productSku.deleteMany();
    await prisma.product.deleteMany();
    await prisma.address.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test('checks out successfully and decrements stock', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ addressId });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(Number(res.body.total)).toBe(750); // 250 * 3
    orderId = res.body.id;

    const sku = await prisma.productSku.findUnique({ where: { id: productSkuId } });
    expect(sku.quantity).toBe(7); // 10 - 3
  });

  test('clears the cart after checkout', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.body.items.length).toBe(0);
  });

  test('order item captures priceAtPurchase correctly', async () => {
    const orderItem = await prisma.orderItem.findFirst({
      where: { orderId },
    });

    expect(Number(orderItem.priceAtPurchase)).toBe(250);
  });

  test('rejects checkout with an empty cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ addressId });

    expect(res.status).toBe(400);
  });

  test('seller updates order status', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'shipped' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('shipped');
  });

  test('rejects cancellation once order is no longer pending', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(400);
  });
});