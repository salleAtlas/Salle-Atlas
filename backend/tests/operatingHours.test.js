const express = require('express');
const request = require('supertest');
const GlobalSetting = require('../src/models/global_setting.model');
const operatingHoursRoutes = require('../src/routes/manager/operatingHours.routes');

const app = express().use(express.json()).use('/manager/operating-hours', operatingHoursRoutes);

describe('B6 - Operating hours & closed days', () => {
  test('PUT updates hours and closed days without creating a second settings document', async () => {
    const res = await request(app)
      .put('/manager/operating-hours')
      .set('Accept', 'application/json')
      .send({
        opening_time: '09:00',
        closing_time: '18:00',
        closed_days_of_week: [0, 6],
        specific_closed_dates: ['2026-12-25'],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.settings).toMatchObject({
      opening_time: '09:00',
      closing_time: '18:00',
      closed_days_of_week: [0, 6],
      specific_closed_dates: ['2026-12-25'],
    });
    expect(await GlobalSetting.countDocuments()).toBe(1);
  });

  test('PUT rejects a closing time before the opening time and bad day numbers', async () => {
    const res = await request(app)
      .put('/manager/operating-hours')
      .set('Accept', 'application/json')
      .send({ opening_time: '18:00', closing_time: '09:00', closed_days_of_week: [7], specific_closed_dates: [] });
    expect(res.statusCode).toBe(400);
  });

  test('PUT accepts comma-separated strings, the format the EJS form posts', async () => {
    const formApp = express()
      .use(express.urlencoded({ extended: true }))
      .use('/manager/operating-hours', operatingHoursRoutes);

    const res = await request(formApp)
      .put('/manager/operating-hours')
      .set('Accept', 'application/json')
      .send('opening_time=08:00&closing_time=20:00&closed_days_of_week=0,6&specific_closed_dates=2026-01-01');

    expect(res.statusCode).toBe(200);
    expect(res.body.settings).toMatchObject({
      closed_days_of_week: [0, 6],
      specific_closed_dates: ['2026-01-01'],
    });
  });

  test('is_within_operating_hours respects closed days, closed dates and the time window', async () => {
    const settings = await GlobalSetting.findOne();
    await settings.update_hours({
      opening_time: '08:00',
      closing_time: '20:00',
      closed_days_of_week: [0],
      specific_closed_dates: ['2030-01-02'],
    });

    const sameDay = (h1, h2, iso) => [new Date(`${iso}T${h1}:00Z`), new Date(`${iso}T${h2}:00Z`)];

    // 2030-01-01 is a Tuesday (not closed) and 09:00-11:00 is inside 08:00-20:00
    expect(settings.is_within_operating_hours(...sameDay('09', '11', '2030-01-01'))).toBe(true);
    // 2030-01-06 is a Sunday -> closed_days_of_week
    expect(settings.is_within_operating_hours(...sameDay('09', '11', '2030-01-06'))).toBe(false);
    // 2030-01-02 is a specific closed date
    expect(settings.is_within_operating_hours(...sameDay('09', '11', '2030-01-02'))).toBe(false);
    // starts before opening time
    expect(settings.is_within_operating_hours(...sameDay('07', '09', '2030-01-01'))).toBe(false);
    // ends after closing time
    expect(settings.is_within_operating_hours(...sameDay('19', '21', '2030-01-01'))).toBe(false);
  });
});
