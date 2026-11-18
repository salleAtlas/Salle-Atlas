# Salle Atlas — Backend (Node.js + Express + MongoDB)

Single backend serving both the **Angular 18+ Client SPA** (`/api/...`) and the **EJS Manager Back-Office** (`/manager/...`) against one shared MongoDB database so availability is always a single source of truth.

---

## 1. Quick Start (Local Development)

### Prerequisites
- **Node.js** (LTS) & **npm**
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) *or* a MongoDB Atlas connection string

### Install & Run
~~~bash
cd backend
npm install
cp .env.example .env
npm run dev
~~~

On startup, `server.js` will:
1. Validate all required variables in `.env` (`src/config/env.config.js`).
2. Connect to MongoDB (`src/config/db.config.js`).
3. Auto-seed the singleton `GlobalSetting` and `OpenSpace` documents if missing (`src/seeds/init.seed.js`).
4. Start Express on `http://localhost:5000`.

### Verify It Works
~~~bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok","db":1}
~~~

### NPM Scripts
| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `nodemon server.js` | Local dev server with auto-restart on save |
| `npm start` | `node server.js` | Production start |
| `npm test` | `jest --runInBand` | Run Jest + Supertest test suite |

---

## 2. Environment Variables (`backend/.env`)

Copy `.env.example` to `.env`. **Never commit `.env`.**

| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGODB_URI` | Yes | Local MongoDB, Atlas, or Cosmos DB URI (`retryWrites=false` for Cosmos) |
| `CLIENT_ORIGIN` | No | Allowed CORS origin for Angular (default: `http://localhost:4200`) |
| `JWT_SECRET` | Yes | Secret for signing client auth JWTs (`24h`) |
| `QR_JWT_SECRET` | Yes | Separate secret for signing single-use QR entry tokens |
| `SESSION_SECRET` | Yes | Secret for `express-session` (Manager EJS back-office) |
| `MANAGER_EMAIL` | Yes | Manager login email (no Manager DB collection exists) |
| `MANAGER_PASSWORD` | Yes | Manager login password |
| `STRIPE_SECRET_KEY` | For D1+ | Stripe test secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | For D1+ | Stripe webhook signing secret (`whsec_...`) |
| `ENABLE_IN_PROCESS_CRON` | No | Set `true` locally so `node-cron` runs the 10-min reservation expiry job |

---

## 3. Architecture Overview (Dual Surface)

| Surface | Route Prefix | Auth Mechanism | Response Type |
| :--- | :--- | :--- | :--- |
| **Client API (Angular)** | `/api/...` | Stateless JWT (`Authorization: Bearer <token>`) via `authClient` | JSON |
| **Manager Back-Office (EJS)** | `/manager/...` | Rolling 30-min `express-session` (`connect-mongo`) via `requireManager` | Server-rendered EJS (+ JSON feeds for FullCalendar & Chart.js) |

---

## 4. Non-Negotiable Guardrails (Read Before Coding)

Breaking any of these will fail PR review:

1. **No `Manager` Model or Collection:** Authenticate manager logins strictly against `env.MANAGER_EMAIL` and `env.MANAGER_PASSWORD`.
2. **Use `Client`, Never `User`:** All customer references use `src/models/client.model.js` (collection `clients`).
3. **Exact `snake_case` Schema Fields:** Do not rename fields in `src/models/`. Both the UML class diagram and Angular `core/models/` depend on the exact `snake_case` property names already locked in.
4. **Express Route Ordering (`/me` before `/:id`):** In `src/routes/api/reservation.routes.js`, `GET /api/reservations/me` **MUST** be declared **BEFORE** `GET /api/reservations/:id` or Express will try to parse `"me"` as a MongoDB `ObjectId`.
5. **Stripe Webhook Raw Body:** `POST /api/payments/webhook` **MUST** use `express.raw({ type: 'application/json' })` and be mounted in `src/app.js` **BEFORE** `app.use(express.json())`. **Only the verified Stripe webhook confirms a reservation** — never trust the browser redirect.
6. **Singletons Stay Singletons:** Never insert a second `GlobalSetting` or `OpenSpace` document; always read/update the single seeded document.
7. **Normalized Enums Only:** Always import statuses from `src/models/enums.js`:
   - `ReservationStatus`: `'PENDING'`, `'CONFIRMED'`, `'EXPIRED'`
   - `PaymentStatus`: `'PENDING'`, `'SUCCESSFUL'`, `'FAILED'`
8. **QR Security & Atomic Scan:** QR tokens contain **only** `{ res_id, ref }` signed with `QR_JWT_SECRET` (never client PII). Entry validation (F2) must mark `qr_used: true` atomically via `findOneAndUpdate({ _id, status: 'CONFIRMED', qr_used: false }, ...)` to prevent double-entry race conditions.
9. **Database Indexing:** Every field used in `.sort()` must have an explicit schema index (required for Cosmos DB compatibility and query performance).
10. **Express 5 Note:** This repo runs **Express 5** (`^5.3.0`). Rejected promises inside `async` route handlers automatically forward to `errorHandler`. Never use bare `'*'` wildcard routes (Express 5 throws on them).

---

## 5. Folder Structure

~~~text
backend/
├── server.js                          # Entry point: connectDB -> runInitialSeed -> listen
├── .env.example                       # Environment template
├── uploads/rooms/                     # Multer destination for uploaded room photos (B2, B3)
├── public/
│   ├── css/manager.css                # Manager EJS styling
│   └── js/                            # Browser scripts for EJS (scanner, FullCalendar, Chart.js)
└── src/
    ├── app.js                         # Express setup, middlewares, raw webhook mount, routers
    ├── config/                        # env, db, session, mail, multer, stripe configs
    ├── models/                        # Locked UML Mongoose schemas + enums.js
    ├── seeds/init.seed.js             # Upserts singleton GlobalSetting & OpenSpace
    ├── middlewares/                   # error, rateLimiter, authClient, requireManager, stripe, qr
    │   └── validators/                # express-validator chains & domain guards
    ├── services/                      # availability, email, qr, stripe business logic
    ├── jobs/                          # expirePendingReservations.job.js (10-min slot release)
    ├── controllers/
    │   ├── api/                       # JSON controllers for /api/...
    │   └── manager/                   # EJS + manager API controllers for /manager/...
    ├── routes/
    │   ├── api/                       # /api/... routers (mounted in index.routes.js)
    │   └── manager/                   # /manager/... routers (mounted in index.routes.js)
    └── views/                         # EJS templates (layouts/, partials/, manager/)
~~~

---

## 6. Locked Mongoose Models (`src/models/`)

All 8 schemas are already created in `src/models/` with their required indexes. Add your story's static/instance methods directly to the corresponding model file.

| File | Collection | Notes & Key Methods to Implement |
| :--- | :--- | :--- |
| `enums.js` | — | Frozen `ReservationStatus` & `PaymentStatus` |
| `client.model.js` | `clients` | `register`, `login`, `request_password_reset`, `reset_password` (A1, A2, A4) |
| `space.model.js` | `spaces` | Abstract base (`discriminatorKey: 'space_type'`). `has_upcoming_reservations` (B4) |
| `room.model.js` | `spaces` | Discriminator `'room'`. `is_available`, `get_included_equipments`, `update_room` (B2, B3, C1) |
| `open_space.model.js` | `spaces` | Singleton discriminator `'open_space'`. `get_remaining_seats`, `is_available` (B5, C1, G3) |
| `equipment.model.js` | `equipments` | No price field. `update_details` (B1) |
| `global_setting.model.js` | `global_settings` | Singleton. `update_hours`, `update_limits`, `is_within_operating_hours` (B6, B7, C1) |
| `reservation.model.js` | `reservations` | `calculate_total`, `check_availability`, `check_capacity`, `confirm`, `expire`, `generate_qr_token`, `generate_qr_pdf_buffer`, `validate_entry` (C2, D1, E1, E2, F2) |
| `payment.model.js` | `payments` | 1-to-0..1 with Reservation. `create_stripe_session`, `confirm_payment` (D1) |

---

## 7. Packages Installed Per Story

Only install packages when you pick up the story that introduces them:

- **A1:** `bcrypt express-validator express-rate-limit`
- **A2:** `jsonwebtoken`
- **A3:** `ejs express-ejs-layouts express-session connect-mongo`
- **A4:** `nodemailer` *(use Mailtrap for testing)*
- **B1:** `method-override`
- **B2:** `multer`
- **C1:** `date-fns`
- **D1:** `stripe node-cron` *(+ Stripe CLI locally: `stripe listen --forward-to localhost:5000/api/payments/webhook`)*
- **E1:** `qrcode`
- **E2:** `pdfkit`
- **F1:** `html5-qrcode pdfjs-dist`
- **G2:** FullCalendar via CDN *(no npm package)*
- **H1:** `chart.js`

---

## 8. Git Workflow for Contributors

Always branch from **`develop`** (never `main`) and open a Pull Request back into **`develop`**:

~~~bash
git checkout develop
git pull origin develop
git checkout -b feat/<story-branch-name>   # e.g., feat/auth-register
~~~

### Hard Story Dependencies
- Merge **B1** (Equipments) before **B2** (Create Room)
- Merge **C1/C2** (Search & Pending Reservation) before **D1** (Stripe Checkout)
- Merge **D1** (Webhook Confirmation) before **E1** (QR Generation) & **F1/F2** (Manager Scanner)

### Before Opening a PR
- Verify `npm run dev` boots without errors.
- Keep `backend/.env` and uploaded test images out of Git.
- Reference your User Story ID (e.g., `feat(A1): client registration endpoint`) in the PR title.
