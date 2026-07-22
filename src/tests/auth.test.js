const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');

describe('Auth', () => {
  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser1',
        email: 'testuser1@example.com',
        password: 'password123',
        role: 'buyer',
      });

    expect(res.status).toBe(201);
    expect(res.body.username).toBe('testuser1');
    expect(res.body.password).toBeUndefined();
  });

  test('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'testuser2',
      email: 'duplicate@example.com',
      password: 'password123',
      role: 'buyer',
    });

    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser3',
      email: 'duplicate@example.com',
      password: 'password123',
      role: 'buyer',
    });

    expect(res.status).toBe(409);
  });

  test('logs in with correct credentials and returns a token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testuser1@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testuser1@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
  });
});