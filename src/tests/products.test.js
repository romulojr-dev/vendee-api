const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');

describe('Products', () => {
  let sellerToken;
  let otherSellerToken;
  let storeId;
  let productId;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      username: 'selleronae',
      email: 'sellerone@example.com',
      password: 'password123',
      role: 'seller',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'sellerone@example.com',
      password: 'password123',
    });
    sellerToken = loginRes.body.token;

    await request(app).post('/api/auth/register').send({
      username: 'sellertwo',
      email: 'sellertwo@example.com',
      password: 'password123',
      role: 'seller',
    });

    const otherLoginRes = await request(app).post('/api/auth/login').send({
      email: 'sellertwo@example.com',
      password: 'password123',
    });
    otherSellerToken = otherLoginRes.body.token;

    const storeRes = await request(app)
      .post('/api/stores')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Seller One Shop' });
    storeId = storeRes.body.id;
  });

  afterAll(async () => {
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test('creates a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Test Shirt', description: 'A shirt for testing' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Shirt');
    productId = res.body.id;
  });

  test('rejects product creation without auth', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'No Auth Product' });

    expect(res.status).toBe(401);
  });

  test('lists all products including the new one', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    const found = res.body.find((p) => p.id === productId);
    expect(found).toBeDefined();
  });

  test('gets a single product by id', async () => {
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productId);
  });

  test('updates a product as the owning seller', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Updated Test Shirt' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Test Shirt');
  });

  test('rejects updating a product as a different seller', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${otherSellerToken}`)
      .send({ name: 'Hijacked Name' });

    expect(res.status).toBe(403);
  });

  test('deletes a product as the owning seller', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.status).toBe(204);
  });

  test('returns 404 for a deleted product', async () => {
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(404);
  });
});