const express = require('express');
const request = require('supertest');
const OpenSpace = require('../src/models/open_space.model');
const Reservation = require('../src/models/reservation.model');
const openSpaceRoutes = require('../src/routes/manager/openSpace.routes');

const app = express().use(express.json()).use('/manager/open-space', openSpaceRoutes);
const at = (h) => new Date(`2030-01-01T${String(h).padStart(2, '0')}:00:00Z`);

describe('B5 - Open space singleton', () => {
  test('PUT updates seats and price without creating a second open space', async () => {
    const res = await request(app)
      .put('/manager/open-space')
      .set('Accept', 'application/json')
      .send({ total_seats: '40', price_per_hour_per_seat: '7.5' });
    expect(res.statusCode).toBe(200);
    expect(res.body.openSpace).toMatchObject({ total_seats: 40, price_per_hour_per_seat: 7.5 });
    expect(await OpenSpace.countDocuments()).toBe(1);
  });

  test('PUT rejects invalid seats and price', async () => {
    const res = await request(app)
      .put('/manager/open-space')
      .set('Accept', 'application/json')
      .send({ total_seats: 0, price_per_hour_per_seat: -1 });
    expect(res.statusCode).toBe(400);
  });

  test('remaining seats depend on the time slot', async () => {
    const space = await OpenSpace.findOne();
    const base = { space_id: space._id, space_type: 'open_space', date: '2030-01-01', unit_price_snapshot: 5, total_amount: 5 };
    await Reservation.create([
      { ...base, client_id: space._id, reference_code: 'R1', start_time: at(9), end_time: at(11), number_of_people: 10, status: 'CONFIRMED', pending_expires_at: at(9) },
      { ...base, client_id: space._id, reference_code: 'R2', start_time: at(10), end_time: at(12), number_of_people: 5, pending_expires_at: new Date(Date.now() + 60000) },
      { ...base, client_id: space._id, reference_code: 'R3', start_time: at(10), end_time: at(12), number_of_people: 8, status: 'EXPIRED', pending_expires_at: at(9) },
    ]);

    expect(await space.get_remaining_seats(at(10), at(11))).toBe(space.total_seats - 15);
    expect(await space.get_remaining_seats(at(11), at(12))).toBe(space.total_seats - 5);
    expect(await space.get_remaining_seats(at(14), at(16))).toBe(space.total_seats);
    expect(await space.is_available(at(10), at(11), space.total_seats)).toBe(false);
    expect(await space.is_available(at(14), at(16), space.total_seats)).toBe(true);
  });
});
