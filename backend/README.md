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
| `npm run check` | `npm test` | CI quality gate test suite |

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
6. **Singletons Stay Singletons:** Never insert a second `GlobalSetting` or `OpenSpace` document; always read/update the single seeded document via repositories.
7. **Normalized Enums Only:** Always import statuses from `src/models/enums.js`:
   - `ReservationStatus`: `'PENDING'`, `'CONFIRMED'`, `'EXPIRED'`
   - `PaymentStatus`: `'PENDING'`, `'SUCCESSFUL'`, `'FAILED'`
8. **QR Security & Atomic Scan:** QR tokens contain **only** `{ res_id, ref }` signed with `QR_JWT_SECRET` (never client PII). Entry validation (F2) must mark `qr_used: true` atomically via `findOneAndUpdate({ _id, status: 'CONFIRMED', qr_used: false }, ...)` to prevent double-entry race conditions.
9. **Database Indexing:** Every field used in `.sort()` must have an explicit schema index (required for Cosmos DB compatibility and query performance).
10. **Express 5 Note:** This repo runs **Express 5** (`^5.3.0`). Rejected promises inside `async` route handlers automatically forward to `errorHandler`. Never use bare `'*'` wildcard routes (Express 5 throws on them).
11. **Strict 8-Layer Architecture:** `src/models/` holds pure Mongoose schemas and indexes only (zero methods, zero statics). All backend features strictly follow the unidirectional 8-layer flow (`routes → validators → controllers → dtos → services → repositories → models` and `mappers → views/JSON`), automatically enforced by `tests/architecture.test.js` in CI.

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
    ├── dtos/                          # Request input DTOs (type-casting, trimming, normalizing)
    ├── mappers/                       # Output mappers (pure functions doc -> safe DTO)
    ├── models/                        # Pure Mongoose schemas + indexes + enums.js (NO methods/statics)
    ├── repositories/                  # Only layer allowed to query MongoDB models
    ├── services/                      # Business logic, domain rules, auth, external services
    ├── seeds/init.seed.js             # Upserts singleton GlobalSetting & OpenSpace via repos
    ├── middlewares/                   # error, rateLimiter, authClient, requireManager, stripe, qr
    │   └── validators/                # express-validator chains & domain guards
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

All 8 schemas in `src/models/` are pure schemas + indexes (no `.methods` or `.statics`). Business logic belongs in `src/services/`, database queries belong in `src/repositories/`, input normalization in `src/dtos/`, and output shaping in `src/mappers/`.

| File | Collection | Architecture Mapping (Repo / DTO / Mapper / Service) |
| :--- | :--- | :--- |
| `enums.js` | — | Frozen `ReservationStatus` & `PaymentStatus` |
| `client.model.js` | `clients` | `client.repository.js`, `auth.dto.js`, `client.mapper.js`, `auth.service.js` |
| `space.model.js` | `spaces` | Abstract base schema (`discriminatorKey: 'space_type'`). |
| `room.model.js` | `spaces` | `room.repository.js`, `room.dto.js`, `space.mapper.js`, `room.service.js` |
| `open_space.model.js` | `spaces` | `openSpace.repository.js`, `openSpace.dto.js`, `space.mapper.js`, `openSpace.service.js` |
| `equipment.model.js` | `equipments` | `equipment.repository.js`, `equipment.dto.js`, `equipment.mapper.js`, `equipment.service.js` |
| `global_setting.model.js` | `global_settings` | `globalSetting.repository.js`, `setting.dto.js`, `setting.mapper.js`, `setting.service.js` |
| `reservation.model.js` | `reservations` | `reservation.repository.js`, `reservation.dto.js`, `reservation.mapper.js`, `reservation.service.js` |
| `payment.model.js` | `payments` | `payment.repository.js`, `payment.dto.js`, `payment.mapper.js`, `stripe.service.js` |

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
