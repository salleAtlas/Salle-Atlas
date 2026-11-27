const express = require('express');
const request = require('supertest');
const GlobalSetting = require('../src/models/global_setting.model');
const settingService = require('../src/services/setting.service');
const { UpdateDurationLimitsDto } = require('../src/dtos/setting.dto');
const durationLimitsRoutes = require('../src/routes/manager/durationLimits.routes');

const app = express().use(express.json()).use('/manager/duration-limits', durationLimitsRoutes);

describe('B7 - Min/max reservation duration limits', () => {
  test('PUT updates the limits without creating a second settings document', async () => {
    const res = await request(app)
      .put('/manager/duration-limits')
      .set('Accept', 'application/json')
      .send({ min_duration_hours: '2', max_duration_hours: '6' });

    expect(res.statusCode).toBe(200);
    expect(res.body.settings).toMatchObject({ min_duration_hours: 2, max_duration_hours: 6 });
    expect(await GlobalSetting.countDocuments()).toBe(1);
  });

  test('PUT rejects a max duration smaller than the min duration', async () => {
    const res = await request(app)
      .put('/manager/duration-limits')
      .set('Accept', 'application/json')
      .send({ min_duration_hours: 5, max_duration_hours: 2 });
    expect(res.statusCode).toBe(400);
  });

  test('PUT rejects non-positive durations', async () => {
    const res = await request(app)
      .put('/manager/duration-limits')
      .set('Accept', 'application/json')
      .send({ min_duration_hours: 0, max_duration_hours: 8 });
    expect(res.statusCode).toBe(400);
  });

  test('update_limits only touches duration fields, leaving opening hours untouched', async () => {
    const before = await settingService.getSettings();

    const updated = await settingService.updateDurationLimits(
      new UpdateDurationLimitsDto({ min_duration_hours: 1, max_duration_hours: 4 })
    );

    expect(updated.min_duration_hours).toBe(1);
    expect(updated.max_duration_hours).toBe(4);
    expect(updated.opening_time).toBe(before.opening_time);
    expect(updated.closing_time).toBe(before.closing_time);
  });
});
