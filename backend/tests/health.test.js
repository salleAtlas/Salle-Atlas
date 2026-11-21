const request = require('supertest');
const app = require('../src/app');
const GlobalSetting = require('../src/models/global_setting.model');
const OpenSpace = require('../src/models/open_space.model');

describe('Backend Foundation Smoke Tests', () => {
  test('GET /api/health returns 200 with active DB status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 1 });
  });

  test('Singleton GlobalSetting and OpenSpace are seeded exactly once', async () => {
    expect(await GlobalSetting.countDocuments()).toBe(1);
    expect(await OpenSpace.countDocuments()).toBe(1);
  });

  test('Unknown route returns 404 JSON via notFound middleware', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
  });
});
