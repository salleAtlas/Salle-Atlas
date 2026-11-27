const request = require('supertest');
const app = require('../src/app');
const Client = require('../src/models/client.model');

describe('Auth API (US A1 - Registration)', () => {
  const validClient = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '+33612345678',
  };

  it('POST /api/auth/register should create a new client with HTTP 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validClient)
      .expect(201);

    expect(res.body.message).toBe('Client registered successfully');
    expect(res.body.client).toBeDefined();
    expect(res.body.client.first_name).toBe(validClient.first_name);
    expect(res.body.client.last_name).toBe(validClient.last_name);
    expect(res.body.client.email).toBe(validClient.email.toLowerCase());
    expect(res.body.client.phone).toBe(validClient.phone);
    expect(res.body.client.password_hash).toBeUndefined(); // Never expose password_hash!

    // Verify in database
    const saved = await Client.findOne({ email: validClient.email });
    expect(saved).not.toBeNull();
    expect(saved.password_hash).toBeDefined();
    expect(saved.password_hash).not.toBe(validClient.password); // Must be hashed
  });

  it('POST /api/auth/register should return 409 Conflict if email is already taken', async () => {
    // Attempt to register again with same email
    const res = await request(app)
      .post('/api/auth/register')
      .send(validClient)
      .expect(409);

    expect(res.body.error).toBe('Email already registered');
  });

  it('POST /api/auth/register should return 400 Bad Request if fields are invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: '',
        last_name: '',
        email: 'invalid-email',
        password: 'short',
      })
      .expect(400);

    expect(res.body.error).toBe('Validation Error');
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});
