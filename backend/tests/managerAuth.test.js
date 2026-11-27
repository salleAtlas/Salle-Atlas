const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { sessionOptions, SESSION_MAX_AGE_MS } = require('../src/config/session.config');
const OpenSpace = require('../src/models/open_space.model');

describe('A3 - Manager Authentication & EJS Shell', () => {
  test('1. Session config contract: rolling is true and maxAge is 30 minutes', () => {
    expect(SESSION_MAX_AGE_MS).toBe(30 * 60 * 1000);
    expect(sessionOptions.rolling).toBe(true);
    expect(sessionOptions.resave).toBe(false);
    expect(sessionOptions.saveUninitialized).toBe(false);
    expect(sessionOptions.cookie).toBeDefined();
    expect(sessionOptions.cookie.httpOnly).toBe(true);
    expect(sessionOptions.cookie.sameSite).toBe('lax');
    expect(sessionOptions.cookie.maxAge).toBe(30 * 60 * 1000);
  });

  test('2. Login page renders: GET /manager/login returns 200 and contains form action', async () => {
    const res = await request(app).get('/manager/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('action="/manager/login"');
    expect(res.text).toContain('name="email"');
    expect(res.text).toContain('name="password"');
  });

  test('3. Protected routes block unauthenticated HTML requests with 302 to /manager/login', async () => {
    const protectedPaths = [
      '/manager',
      '/manager/equipments',
      '/manager/open-space',
      '/manager/operating-hours',
      '/manager/duration-limits',
    ];

    for (const path of protectedPaths) {
      const res = await request(app).get(path);
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/manager/login');
    }
  });

  test('4. Protected routes block unauthenticated JSON requests with 401', async () => {
    const res = await request(app)
      .get('/manager/equipments')
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Authentification manager requise.' });
  });

  test('5. Invalid credentials rejected with 302 (HTML) and 401 (JSON)', async () => {
    // HTML rejection
    const resHtml = await request(app)
      .post('/manager/login')
      .send({ email: process.env.MANAGER_EMAIL, password: 'wrong-password' });

    expect(resHtml.statusCode).toBe(302);
    expect(resHtml.headers.location).toBe('/manager/login');

    // JSON rejection
    const resJson = await request(app)
      .post('/manager/login')
      .set('Accept', 'application/json')
      .send({ email: process.env.MANAGER_EMAIL, password: 'wrong-password' });

    expect(resJson.statusCode).toBe(401);
    expect(resJson.body).toEqual({ error: 'Identifiants invalides.' });

    // Verify access is still blocked
    const resBlocked = await request(app).get('/manager/equipments');
    expect(resBlocked.statusCode).toBe(302);
    expect(resBlocked.headers.location).toBe('/manager/login');
  });

  test('6. Valid credentials authenticate and unlock all Wave 1 manager pages', async () => {
    const agent = request.agent(app);

    // Login with uppercase email to verify case insensitivity
    const loginRes = await agent
      .post('/manager/login')
      .type('form')
      .send({
        email: process.env.MANAGER_EMAIL.toUpperCase(),
        password: process.env.MANAGER_PASSWORD,
      });

    expect(loginRes.statusCode).toBe(302);
    expect(loginRes.headers.location).toBe('/manager/equipments');

    // Access all Wave 1 pages as authenticated manager
    const wave1Paths = [
      '/manager/equipments',
      '/manager/open-space',
      '/manager/operating-hours',
      '/manager/duration-limits',
    ];

    for (const path of wave1Paths) {
      const pageRes = await agent.get(path);
      expect(pageRes.statusCode).toBe(200);
      expect(pageRes.text).toContain('Salle Atlas');
      expect(pageRes.text).toContain('manager-shell');
      expect(pageRes.text).toContain('Deconnexion');
    }

    // Accessing /manager/login while authenticated redirects to /manager/equipments
    const loginWhileAuth = await agent.get('/manager/login');
    expect(loginWhileAuth.statusCode).toBe(302);
    expect(loginWhileAuth.headers.location).toBe('/manager/equipments');

    // POST /manager/open-space?_method=PUT (method-override query param) succeeds while authenticated
    const putRes = await agent
      .post('/manager/open-space?_method=PUT')
      .type('form')
      .send({
        total_seats: '35',
        price_per_hour_per_seat: '8.5',
      });

    expect(putRes.statusCode).toBe(302);
    expect(putRes.headers.location).toBe('/manager/open-space');

    const updated = await OpenSpace.findOne();
    expect(updated.total_seats).toBe(35);
    expect(updated.price_per_hour_per_seat).toBe(8.5);
  });

  test('7. Logout destroys session and redirects to /manager/login', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/manager/login')
      .type('form')
      .send({
        email: process.env.MANAGER_EMAIL,
        password: process.env.MANAGER_PASSWORD,
      });

    // Verify authenticated
    const authCheck = await agent.get('/manager/equipments');
    expect(authCheck.statusCode).toBe(200);

    // Logout
    const logoutRes = await agent.post('/manager/logout');
    expect(logoutRes.statusCode).toBe(302);
    expect(logoutRes.headers.location).toBe('/manager/login');

    // Verify session destroyed and protected page now redirects to /manager/login
    const postLogoutCheck = await agent.get('/manager/equipments');
    expect(postLogoutCheck.statusCode).toBe(302);
    expect(postLogoutCheck.headers.location).toBe('/manager/login');
  });

  test('8. No Manager database model or collection exists in MongoDB', async () => {
    const collections = await mongoose.connection.db.listCollections({ name: 'managers' }).toArray();
    expect(collections).toHaveLength(0);
  });
});
