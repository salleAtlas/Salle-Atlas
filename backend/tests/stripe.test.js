const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const stripe = require('../src/config/stripe.config');
const env = require('../src/config/env.config');
const Reservation = require('../src/models/reservation.model');
const Payment = require('../src/models/payment.model');
const { ReservationStatus, PaymentStatus } = require('../src/models/enums');
const { runExpirySweep } = require('../src/jobs/expirePendingReservations.job');

describe('Stripe Checkout, Webhook & 10-Min Expiry (D1)', () => {
  let token = '';
  let clientId = '';
  let otherToken = '';
  let reservationId = '';

  beforeAll(async () => {
    const reg1 = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Oussema',
        last_name: 'Test',
        email: 'oussema.stripe@example.com',
        password: 'password123',
      })
      .expect(201);

    clientId = reg1.body.client._id;

    const login1 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'oussema.stripe@example.com',
        password: 'password123',
      })
      .expect(200);

    token = login1.body.token;

    await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Other',
        last_name: 'User',
        email: 'other.stripe@example.com',
        password: 'password123',
      })
      .expect(201);

    const login2 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'other.stripe@example.com',
        password: 'password123',
      })
      .expect(200);

    otherToken = login2.body.token;

    const now = new Date();
    const resDoc = await Reservation.create({
      client_id: clientId,
      space_id: new mongoose.Types.ObjectId(),
      reference_code: 'RES-TEST-001',
      space_type: 'room',
      date: '2026-12-01',
      start_time: new Date('2026-12-01T10:00:00Z'),
      end_time: new Date('2026-12-01T12:00:00Z'),
      number_of_people: 2,
      unit_price_snapshot: 25,
      total_amount: 50,
      status: ReservationStatus.PENDING,
      pending_expires_at: new Date(now.getTime() + 10 * 60 * 1000),
    });

    reservationId = resDoc._id.toString();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('POST /api/payments/checkout-session requires auth', async () => {
    await request(app)
      .post('/api/payments/checkout-session')
      .send({ reservation_id: reservationId })
      .expect(401);
  });

  it('POST /api/payments/checkout-session creates session and payment record', async () => {
    jest.spyOn(stripe.checkout.sessions, 'create').mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });

    const res = await request(app)
      .post('/api/payments/checkout-session')
      .set('Authorization', `Bearer ${token}`)
      .send({ reservation_id: reservationId })
      .expect(200);

    expect(res.body.checkout_url).toBe('https://checkout.stripe.com/pay/cs_test_123');
    expect(res.body.session_id).toBe('cs_test_123');

    const payment = await Payment.findOne({ stripe_session_id: 'cs_test_123' });
    expect(payment).not.toBeNull();
    expect(payment.status).toBe(PaymentStatus.PENDING);
    expect(payment.amount).toBe(50);
  });

  it('GET /api/reservations/:id forbids access to another client', async () => {
    await request(app)
      .get(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });

  it('POST /api/payments/webhook rejects invalid signature', async () => {
    await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', 'bad_sig')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_1' }))
      .expect(400);
  });

  it('POST /api/payments/webhook confirms reservation on checkout.session.completed', async () => {
    const payload = JSON.stringify({
      id: 'evt_test_completed',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: { reservation_id: reservationId },
        },
      },
    });

    const sig = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: env.STRIPE_WEBHOOK_SECRET,
    });

    await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', sig)
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200);

    const updatedRes = await Reservation.findById(reservationId);
    const updatedPay = await Payment.findOne({ stripe_session_id: 'cs_test_123' });

    expect(updatedRes.status).toBe(ReservationStatus.CONFIRMED);
    expect(updatedPay.status).toBe(PaymentStatus.SUCCESSFUL);
    expect(updatedPay.payment_date).not.toBeNull();

    const statusRes = await request(app)
      .get(`/api/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(statusRes.body.reservation.status).toBe(ReservationStatus.CONFIRMED);
  });

  it('runExpirySweep expires old pending reservations without touching confirmed ones', async () => {
    const past = new Date(Date.now() - 60 * 1000);
    const expiredTarget = await Reservation.create({
      client_id: clientId,
      space_id: new mongoose.Types.ObjectId(),
      reference_code: 'RES-TEST-EXP',
      space_type: 'open_space',
      date: '2026-12-01',
      start_time: new Date('2026-12-01T14:00:00Z'),
      end_time: new Date('2026-12-01T16:00:00Z'),
      number_of_people: 1,
      unit_price_snapshot: 10,
      total_amount: 20,
      status: ReservationStatus.PENDING,
      pending_expires_at: past,
    });

    await runExpirySweep();

    const refreshedExpired = await Reservation.findById(expiredTarget._id);
    const refreshedConfirmed = await Reservation.findById(reservationId);

    expect(refreshedExpired.status).toBe(ReservationStatus.EXPIRED);
    expect(refreshedConfirmed.status).toBe(ReservationStatus.CONFIRMED);
  });
});
