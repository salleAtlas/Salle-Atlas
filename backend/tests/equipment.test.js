const request = require('supertest');
const app = require('../src/app');
const Room = require('../src/models/room.model');

describe('B1 - Equipment Management', () => {
  let agent;

  beforeEach(async () => {
    agent = request.agent(app);
    await agent
      .post('/manager/login')
      .type('form')
      .send({
        email: process.env.MANAGER_EMAIL,
        password: process.env.MANAGER_PASSWORD,
      });
  });

  test('POST /manager/equipments creates an equipment (201 JSON) and rejects duplicates (400)', async () => {
    const createRes = await agent
      .post('/manager/equipments')
      .set('Accept', 'application/json')
      .send({ name: 'Projecteur 4K', icon: 'bi-projector', description: 'Video projecteur HD' });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.message).toBe('Equipement cree');
    expect(createRes.body.equipment).toMatchObject({
      name: 'Projecteur 4K',
      icon: 'bi-projector',
      description: 'Video projecteur HD',
      is_active: true,
    });

    const duplicateRes = await agent
      .post('/manager/equipments')
      .set('Accept', 'application/json')
      .send({ name: 'Projecteur 4K', icon: 'bi-projector' });

    expect(duplicateRes.statusCode).toBe(400);
    expect(duplicateRes.body.error).toBe('Un equipement avec ce nom existe deja.');
  });

  test('GET /manager/equipments returns sorted list + usageMap', async () => {
    await agent
      .post('/manager/equipments')
      .set('Accept', 'application/json')
      .send({ name: 'Tableau Blanc' });

    const res = await agent
      .get('/manager/equipments')
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.equipments)).toBe(true);
    expect(res.body.usageMap).toBeDefined();
    const names = res.body.equipments.map((e) => e.name);
    const sortedNames = [...names].sort();
    expect(names).toEqual(sortedNames);
  });

  test('PUT /manager/equipments/:id updates details (200)', async () => {
    const createRes = await agent
      .post('/manager/equipments')
      .set('Accept', 'application/json')
      .send({ name: 'Microphone Sans Fil' });

    const eqId = createRes.body.equipment._id;

    const updateRes = await agent
      .put(`/manager/equipments/${eqId}`)
      .set('Accept', 'application/json')
      .send({ name: 'Microphone Sans Fil Pro', description: 'HF double canal' });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.message).toBe('Equipement modifie');
    expect(updateRes.body.equipment.name).toBe('Microphone Sans Fil Pro');
    expect(updateRes.body.equipment.description).toBe('HF double canal');
  });

  test('DELETE /manager/equipments/:id is blocked (400) when assigned to a Room, succeeds (200) when unused', async () => {
    const createRes = await agent
      .post('/manager/equipments')
      .set('Accept', 'application/json')
      .send({ name: 'Wifi Routeur 6E' });

    const eqId = createRes.body.equipment._id;

    const room = await Room.create({
      name: 'Salle Atlas Conf',
      description: 'Salle de conference test',
      space_type: 'room',
      capacity: 12,
      price_per_hour: 25,
      equipments: [eqId],
    });

    const deleteBlockedRes = await agent
      .delete(`/manager/equipments/${eqId}`)
      .set('Accept', 'application/json');

    expect(deleteBlockedRes.statusCode).toBe(400);
    expect(deleteBlockedRes.body.error).toBe(
      'Ce equipement est utilise par une salle et ne peut pas etre supprime.'
    );

    await Room.findByIdAndDelete(room._id);

    const deleteSuccessRes = await agent
      .delete(`/manager/equipments/${eqId}`)
      .set('Accept', 'application/json');

    expect(deleteSuccessRes.statusCode).toBe(200);
    expect(deleteSuccessRes.body.message).toBe('Equipement supprime');
  });
});
