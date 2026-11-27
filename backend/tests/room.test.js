const express = require('express');
const request = require('supertest');
const Room = require('../src/models/room.model');
const Equipment = require('../src/models/equipment.model');
const Reservation = require('../src/models/reservation.model');
const roomRoutes = require('../src/routes/manager/room.routes');

const app = express().use(express.json()).use('/manager/rooms', roomRoutes);

function createRoom(data) {
  return request(app).post('/manager/rooms').set('Accept', 'application/json').send(data);
}

describe('B2 B3 B4 - Manager rooms', () => {
  test('B2 creates a room with equipments', async () => {
    const wifi = await Equipment.create({ name: 'Wifi' });
    const res = await createRoom({ name: 'Salle A', description: 'Petite salle', capacity: '6', price_per_hour: '20', equipments: [String(wifi._id)] });
    expect(res.statusCode).toBe(201);
    expect(res.body.room).toMatchObject({ name: 'Salle A', capacity: 6, price_per_hour: 20, is_active: true });
    expect(await Room.countDocuments()).toBe(1);
  });

  test('B2 rejects invalid data and duplicate names', async () => {
    const bad = await createRoom({ name: '', description: 'x', capacity: 0, price_per_hour: -1 });
    expect(bad.statusCode).toBe(400);
    const duplicate = await createRoom({ name: 'Salle A', description: 'x', capacity: 2, price_per_hour: 5 });
    expect(duplicate.statusCode).toBe(400);
  });

  test('B3 updates an existing room', async () => {
    const room = await Room.findOne({ name: 'Salle A' });
    const res = await request(app)
      .put('/manager/rooms/' + room._id)
      .set('Accept', 'application/json')
      .send({ name: 'Salle A+', description: 'Plus grande', capacity: 10, price_per_hour: 30, is_active: false });
    expect(res.statusCode).toBe(200);
    expect(res.body.room).toMatchObject({ name: 'Salle A+', capacity: 10, is_active: false });
  });

  test('B4 blocks delete when a future reservation exists, then deletes', async () => {
    const room = await Room.findOne({ name: 'Salle A+' });
    const later = new Date(Date.now() + 24 * 3600 * 1000);
    const reservation = await Reservation.create({
      client_id: room._id, space_id: room._id, space_type: 'room', reference_code: 'ROOM1',
      date: '2030-01-01', start_time: later, end_time: later, number_of_people: 2,
      unit_price_snapshot: 30, total_amount: 30, status: 'CONFIRMED', pending_expires_at: later,
    });

    const blocked = await request(app).delete('/manager/rooms/' + room._id).set('Accept', 'application/json');
    expect(blocked.statusCode).toBe(400);

    await Reservation.findByIdAndDelete(reservation._id);
    const res = await request(app).delete('/manager/rooms/' + room._id).set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(await Room.countDocuments()).toBe(0);
  });

  test('returns 404 for unknown room and 400 for bad id', async () => {
    const missing = await request(app).delete('/manager/rooms/507f1f77bcf86cd799439011').set('Accept', 'application/json');
    expect(missing.statusCode).toBe(404);
    const bad = await request(app).delete('/manager/rooms/abc').set('Accept', 'application/json');
    expect(bad.statusCode).toBe(400);
  });
});
