const request = require('supertest');
const app = require('../src/app');
const Client = require('../src/models/client.model');

describe('Auth API (US A1 & A2 - Registration & Login)', () => {
  const validClient = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '+33612345678',
  };

  let authToken = '';

  describe('US A1: Registration', () => {
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
      expect(res.body.client.password_hash).toBeUndefined();

      const saved = await Client.findOne({ email: validClient.email });
      expect(saved).not.toBeNull();
      expect(saved.password_hash).toBeDefined();
      expect(saved.password_hash).not.toBe(validClient.password);
    });

    it('POST /api/auth/register should return 409 Conflict if email is already taken', async () => {
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

  describe('US A2: Login & Authentication', () => {
    it('POST /api/auth/login should return 200 with JWT token and client on valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validClient.email,
          password: validClient.password,
        })
        .expect(200);

      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');
      expect(res.body.client).toBeDefined();
      expect(res.body.client.email).toBe(validClient.email.toLowerCase());
      expect(res.body.client.password_hash).toBeUndefined();

      authToken = res.body.token;
    });

    it('POST /api/auth/login should return 401 on wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validClient.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body.error).toBe('Invalid email or password');
    });

    it('POST /api/auth/login should return 401 on unregistered email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(res.body.error).toBe('Invalid email or password');
    });

    it('POST /api/auth/login should return 400 on invalid input payload', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: '',
        })
        .expect(400);

      expect(res.body.error).toBe('Validation Error');
    });

    it('GET /api/auth/me should return 200 and client profile when authenticated with Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.client).toBeDefined();
      expect(res.body.client.email).toBe(validClient.email.toLowerCase());
      expect(res.body.client.first_name).toBe(validClient.first_name);
      expect(res.body.client.password_hash).toBeUndefined();
    });

    it('GET /api/auth/me should return 401 when Authorization header is missing', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.error).toBe('Authentication required. No token provided.');
    });

    it('GET /api/auth/me should return 401 when token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);

      expect(res.body.error).toBe('Invalid or expired token');
    });
  });
});
