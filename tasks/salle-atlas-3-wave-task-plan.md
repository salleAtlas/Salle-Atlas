# Salle Atlas — 3-Wave Task & Execution Plan

This document is the team's active sprint board and execution guide for **Salle Atlas**. It organizes all **27 User Stories (`A1`–`H1`)** into **3 sequential waves of conflict-free vertical tracks** so teammates can work in parallel without stepping on each other's files or hitting `package-lock.json` merge conflicts.

---

## 1. Current Repository Status

| Task | Scope | Branch | Status |
| :--- | :--- | :--- | :---: |
| **S1** | Backend foundation (Express 5, Mongoose 9, all 8 locked UML schemas, singleton seed, `GET /api/health`, `backend/README.md`) | `chore/backend-setup` | **DONE** |
| **S2** | Frontend foundation (Angular 18 standalone, Angular Material `azure-blue`, all 7 locked `snake_case` interfaces, navbar shell, unit tests, `frontend/README.md`) | `chore/client-setup` | **DONE** |
| **W1 Deps** | All Wave 1 backend dependencies pre-installed & audited (`bcrypt`, `express-validator`, `express-rate-limit`, `jsonwebtoken`, `ejs`, `express-ejs-layouts`, `express-session`, `connect-mongo`, `method-override`) | `chore/wave1-deps` | **DONE** |

> **Starting Point:** `S1`, `S2`, and `chore/wave1-deps` are ready on `develop`. All feature development starts at **Wave 1**—no teammate needs to run `npm install` on a feature branch.

---

## 2. How the 3-Wave Hybrid Approach Works

Instead of assigning all 27 stories on Day 1 (which causes deadlocks and merge conflicts) or grabbing single stories randomly (which causes file collisions on shared models/controllers), we work **one wave at a time**:

1. **Pre-wave dependency PRs (`chore/waveX-deps`).** Before each wave kicks off, all npm packages needed for that wave are installed and audited once in a dedicated `chore/` PR merged into `develop`. **Do not run `npm install` inside `feat/` branches**—just run that wave's `npm ci` sync command below.
2. **Assign tracks for the current wave only.** Each track groups tightly coupled stories so **one developer owns the shared files** (`client.model.js`, `room.model.js`, `reservation.model.js`, etc.).
3. **One branch and one PR per story.** Even if you own a multi-story track (e.g., `B2 + B3 + B4`), open separate small PRs (`feat/manager-room-create` → `feat/manager-room-update` → `feat/manager-room-delete`) so reviews stay fast and `develop` stays green.
4. **Pull `develop` before every new branch.** As soon as a wave's core blockers merge, assign the next wave dynamically based on who is free.
5. **Tight Deadline Option (P1 MVP First):** If time gets tight, defer **P2** (`A4`, `B6`, `B7`, `C3`, `D2`, `E3`, `E4`) and **P3** (`C4`, `H1`) stories until every **P1** story is merged and tested end-to-end.

---

## 3. Git Workflow & Dependency Hygiene

`main` and `develop` are protected by a GitHub Ruleset (**direct pushes are blocked**).

~~~bash
# 1. Sync develop and install the exact locked packages for your current wave
git checkout develop
git pull origin develop
# -> Run the wave's `npm ci` command listed at the top of Wave 1 / Wave 2 / Wave 3

# 2. Cut your story branch off develop
git checkout -b feat/<story-branch-name>

# 3. Push and open a PR targeting `develop` (NEVER `main`)
git push -u origin feat/<story-branch-name>
~~~

> **Why `npm ci` instead of `npm install`?** `npm ci` installs the exact versions and integrity hashes locked in `package-lock.json` without modifying it. That guarantees every teammate runs the exact same dependency tree with zero lockfile conflicts.

---

## Wave 1 — Unblockers (Auth, Layouts & Space Rules)

### Wave 1 Setup Command (Packages Already Pre-Installed via `chore/wave1-deps`)

All Wave 1 backend packages are **already installed and locked** on `develop` (no new frontend packages are needed in Wave 1). **Do not run `npm install`**—run this once before cutting your Wave 1 branch:

~~~bash
git checkout develop && git pull origin develop && (cd backend && npm ci) && (cd frontend && npm ci)
~~~

*(If your `frontend/node_modules` is already synced from S2, you only need `cd backend && npm ci`.)*

> **Merge Priority:** **Track 1.2 (`A3`)** must merge first because it introduces `requireManager` and `views/layouts/manager-layout.ejs` needed by all Manager EJS pages. Tracks 1.3, 1.4, and 1.5 can build their model methods, validators, and controller logic immediately and wire the layout once `A3` lands.

### Track 1.1 — Client Authentication (`A1 + A2`)
- **Assignee:** `@youssef_massmoudi`
- **Stories & Branches:**
  - [ ] **A1 (P1):** Client Registration — `feat/auth-register`
  - [ ] **A2 (P1):** Client Login & Auth Protection — `feat/auth-login`
- **Pre-Installed Packages Used (Backend):** `bcrypt`, `express-validator`, `express-rate-limit`, `jsonwebtoken` *(already in `package.json`)*
- **Owned Files:**
  - Backend: `src/models/client.model.js` *(append `register`, `login`)*, `src/middlewares/rateLimiter.middleware.js`, `src/middlewares/authClient.middleware.js`, `src/middlewares/validators/auth.validator.js`, `src/controllers/api/auth.controller.js`, `src/routes/api/auth.routes.js`
  - Frontend: `core/services/auth.service.ts`, `core/guards/auth.guard.ts`, `core/interceptors/auth.interceptor.ts`, `features/auth/register/`, `features/auth/login/`
- **Routes:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Unblocks:** `C2`, `D1`, `E1`, `G1`, `A4`

### Track 1.2 — Manager Back-Office Auth & EJS Shell (`A3`) — MERGE FIRST
- **Assignee:** `@mootez_mannai`
- **Stories & Branches:**
  - [ ] **A3 (P1):** Manager Back-Office Authentication — `feat/manager-auth`
- **Pre-Installed Packages Used (Backend):** `ejs`, `express-ejs-layouts`, `express-session`, `connect-mongo` *(already in `package.json`)*
- **Owned Files:**
  - Backend: `src/config/session.config.js`, `src/middlewares/requireManager.middleware.js`, `src/controllers/manager/managerAuth.controller.js`, `src/routes/manager/auth.routes.js`, `src/routes/manager/index.routes.js`, `src/app.js` *(enable EJS + layouts + sessions)*
  - Views: `src/views/layouts/manager-layout.ejs`, `src/views/partials/{head,navbar,sidebar,flash-messages,footer}.ejs`, `src/views/manager/login.ejs`, `public/css/manager.css`
- **Routes:** `GET /manager/login`, `POST /manager/login`, `POST /manager/logout`
- **Guardrail:** Validate strictly against `env.MANAGER_EMAIL` & `env.MANAGER_PASSWORD` (no `Manager` DB model). Rolling 30-min session via `connect-mongo`.
- **Unblocks:** All Epic `B`, `F`, `G2`, `G3`, `H1` EJS pages

### Track 1.3 — Equipment Catalog (`B1`)
- **Assignee:** `@oussema_mellouli`
- **Stories & Branches:**
  - [ ] **B1 (P1):** Equipment Catalog Management — `feat/manager-equipments`
- **Pre-Installed Packages Used (Backend):** `method-override`, `express-validator` *(already in `package.json`)*
- **Owned Files:**
  - Backend: `src/models/equipment.model.js` *(append `update_details`)*, `src/middlewares/validators/equipment.validator.js` (`validateEquipment`, `checkEquipmentNotUsed`), `src/controllers/manager/managerEquipment.controller.js`, `src/routes/manager/equipment.routes.js`, `src/views/manager/equipments/index.ejs`
- **Routes:** `GET/POST /manager/equipments`, `PUT/DELETE /manager/equipments/:id`
- **Guardrail:** Equipments have **no price field**; block deletion if assigned to any room.
- **Unblocks:** `B2` (hard dependency)

### Track 1.4 — Open Space Singleton (`B5`)
- **Assignee:** `@wajeeh_soltani`
- **Stories & Branches:**
  - [ ] **B5 (P1):** Configure Open Space Singleton — `feat/manager-open-space`
- **Pre-Installed Packages Used (Backend):** `method-override`, `express-validator` *(already in `package.json`)*
- **Owned Files:**
  - Backend: `src/models/open_space.model.js` *(append `get_remaining_seats`, `is_available`)*, `src/middlewares/validators/openSpace.validator.js`, `src/controllers/manager/managerOpenSpace.controller.js`, `src/routes/manager/openSpace.routes.js`, `src/views/manager/open-space/edit.ejs`
- **Routes:** `GET /manager/open-space`, `PUT /manager/open-space`
- **Guardrail:** Always update the single seeded `OpenSpace` document; never insert a second one.
- **Unblocks:** `C1`, `G3`

### Track 1.5 — Operating Hours & Duration Limits (`B6 + B7`)
- **Assignee:** `@ayoub_timoumi`
- **Stories & Branches:**
  - [ ] **B6 (P2):** Operating Hours & Closed Days — `feat/manager-opening-hours`
  - [ ] **B7 (P2):** Min / Max Duration Limits — `feat/manager-duration-limits`
- **Pre-Installed Packages Used (Backend):** `method-override`, `express-validator` *(already in `package.json`)*
- **Owned Files:**
  - Backend: `src/models/global_setting.model.js` *(append `update_hours`, `update_limits`, `is_within_operating_hours`)*, `src/middlewares/validators/setting.validator.js`, `src/controllers/manager/managerSetting.controller.js`, `src/routes/manager/setting.routes.js`, `src/views/manager/settings/{hours,duration}.ejs`
- **Routes:** `GET/PUT /manager/settings/hours`, `GET/PUT /manager/settings/duration`
- **Guardrail:** Always update the single seeded `GlobalSetting` document.
- **Unblocks:** `C1` search validation

---

## Wave 2 — Core MVP Spine (Rooms, Search, Booking, Stripe & Mailer)

### Wave 2 Setup Command (Pre-Installed via `chore/wave2-deps` Before Kickoff)

Before Wave 2 starts, one pre-wave PR (`chore/wave2-deps`) will install all Wave 2 packages (`backend`: `multer`, `date-fns`, `stripe`, `node-cron`, `nodemailer`; `frontend`: `date-fns`). Once `chore/wave2-deps` is merged into `develop`, **do not run `npm install`**—every teammate runs this sync command:

~~~bash
git checkout develop && git pull origin develop && (cd backend && npm ci) && (cd frontend && npm ci)
~~~

*(For Track 2.4 local webhook testing, also run Stripe CLI in a separate terminal: `stripe listen --forward-to localhost:5000/api/payments/webhook`.)*

> **Merge Priority:** Merge **`B2`** quickly so `C1` has real rooms to search, and merge **`C2`** quickly so **`D1`** can build Checkout + Webhook confirmation on top of real `PENDING` reservations.

### Track 2.1 — Manager Room CRUD (`B2 + B3 + B4`)
- **Assignee:** `@unassigned`
- **Stories & Branches:**
  - [ ] **B2 (P1):** Create Ready-to-Book Room — `feat/manager-room-create`
  - [ ] **B3 (P1):** Update Existing Room — `feat/manager-room-update`
  - [ ] **B4 (P1):** Delete Room — `feat/manager-room-delete`
- **Pre-Installed Packages Used (Backend):** `multer` *(via `chore/wave2-deps`)*
- **Owned Files:**
  - Backend: `src/config/multer.config.js`, `src/models/space.model.js` *(append `has_upcoming_reservations`)*, `src/models/room.model.js` *(append `get_included_equipments`, `update_room`)*, `src/middlewares/validators/room.validator.js`, `src/controllers/manager/managerRoom.controller.js`, `src/routes/manager/room.routes.js`
  - Views: `src/views/manager/rooms/{index,new,edit}.ejs`, `src/views/partials/delete-confirm-modal.ejs`
- **Routes:** `GET /manager/rooms`, `GET /manager/rooms/new`, `POST /manager/rooms`, `GET /manager/rooms/:id/edit`, `PUT /manager/rooms/:id`, `DELETE /manager/rooms/:id`
- **Guardrail:** Block room deletion if any future `PENDING` or `CONFIRMED` reservation exists.

### Track 2.2 — Client Availability Search & Filters (`C1 + C3`)
- **Assignee:** `@unassigned`
- **Stories & Branches:**
  - [ ] **C1 (P1):** Search Available Spaces — `feat/client-search-availability`
  - [ ] **C3 (P2):** Combinable Search Filters — `feat/client-search-filters`
- **Pre-Installed Packages Used (Backend + Frontend):** `date-fns` *(via `chore/wave2-deps`)*
- **Owned Files:**
  - Backend: `src/middlewares/validators/search.validator.js`, `src/services/availability.service.js`, `src/controllers/api/space.controller.js`, `src/routes/api/space.routes.js`
  - Frontend: `core/services/space.service.ts`, `features/spaces/{search,search-results,room-details}/`, `shared/components/search-filters/` *(RxJS `debounceTime(300)`)*
- **Routes:** `GET /api/spaces/available?date=&start=&duration=&minCapacity=&equipments=&maxPrice=`, `GET /api/rooms/:id`, `GET /api/equipments`

### Track 2.3 — Pending Reservation Creation (`C2`) — MERGE FAST FOR D1
- **Assignee:** `@unassigned`
- **Stories & Branches:**
  - [ ] **C2 (P1):** People Count & Pending Reservation — `feat/client-reservation-people`
- **Pre-Installed Packages Used:** None new *(uses existing Wave 1/2 packages)*
- **Owned Files:**
  - Backend: `src/models/reservation.model.js` *(append `check_availability`, `check_capacity`, `calculate_total`)*, `src/middlewares/validators/reservation.validator.js`, `src/controllers/api/reservation.controller.js`, `src/routes/api/reservation.routes.js`
  - Frontend: `core/services/reservation.service.ts`, `features/booking/booking-confirm/`
- **Routes:** `POST /api/reservations`
- **Guardrail:** Save `status: 'PENDING'`, `unit_price_snapshot`, `total_amount`, unique `reference_code`, and `pending_expires_at = now + 10 min`.
- **Unblocks:** `D1` (hard dependency)

### Track 2.4 — Stripe Checkout, Webhook & 10-Min Expiry (`D1`)
- **Assignee:** `@unassigned`
- **Stories & Branches:**
  - [ ] **D1 (P1):** Stripe Checkout & 10-Min Slot Release — `feat/stripe-checkout`
- **Pre-Installed Packages Used (Backend):** `stripe`, `node-cron` *(via `chore/wave2-deps`; local testing via Stripe CLI)*
- **Owned Files:**
  - Backend: `src/config/stripe.config.js`, `src/models/payment.model.js` *(append `create_stripe_session`, `confirm_payment`)*, `src/models/reservation.model.js` *(append `confirm`, `expire`)*, `src/middlewares/stripe.middleware.js`, `src/services/stripe.service.js`, `src/jobs/expirePendingReservations.job.js`, `src/controllers/api/payment.controller.js`, `src/routes/api/payment.routes.js`, `src/app.js` *(mount raw webhook before `express.json()`)*
  - Frontend: `core/services/payment.service.ts`, `features/booking/{payment-success,payment-failed}/`
- **Routes:** `POST /api/payments/checkout-session`, `POST /api/payments/webhook`, `GET /api/reservations/:id`
- **Guardrails:**
  - Mount `POST /api/payments/webhook` with `express.raw({ type: 'application/json' })` **before** `app.use(express.json())`.
  - **Only the verified Stripe webhook confirms a reservation** — frontend `/payment-success` must verify status via `GET /api/reservations/:id`.
  - Run `node-cron` 1-minute sweep when `ENABLE_IN_PROCESS_CRON=true`.
- **Unblocks:** `E1`, `F1/F2`, `D2`, `E3`

### Track 2.5 — Mailer Setup & Client Password Reset (`A4`)
- **Assignee:** `@unassigned`
- **Stories & Branches:**
  - [ ] **A4 (P2):** Client Password Reset — `feat/auth-reset-password`
- **Pre-Installed Packages Used (Backend):** `nodemailer` *(via `chore/wave2-deps`; use Mailtrap for dev/testing)*
- **Owned Files:**
  - Backend: `src/config/mail.config.js`, `src/services/email.service.js` (`sendPasswordResetEmail`), `src/models/client.model.js` *(append `request_password_reset`, `reset_password`)*
  - Frontend: `features/auth/{forgot-password,reset-password}/`
- **Routes:** `POST /api/auth/forgot-password`, `POST /api/auth/reset-password/:token`
- **Unblocks:** `D2`, `E3` (reuses `mail.config.js` & `email.service.js`)

---

## Wave 3 — QR Ecosystem, Tracking & Analytics

### Wave 3 Setup Command (Pre-Installed via `chore/wave3-deps` Before Kickoff)

Before Wave 3 starts, one pre-wave PR (`chore/wave3-deps`) will install all Wave 3 packages (`backend`: `qrcode`, `pdfkit`, `html5-qrcode`, `pdfjs-dist`, `chart.js`; `frontend`: `angular-calendar` or `@fullcalendar/angular` if Angular 18 peer-dep conflicts occur). Once `chore/wave3-deps` is merged into `develop`, **do not run `npm install`**—every teammate runs this sync command:

~~~bash
git checkout develop && git pull origin develop && (cd backend && npm ci) && (cd frontend && npm ci)
~~~

> All core booking and payment pipelines are merged into `develop` by this wave, so all 5 tracks below can run completely in parallel.

### Track 3.1 — Client QR Generation, Downloads & Status (`E1 + E2 + E4`)
- **Assignee:** `@unassigned`
- **Stories & Branches:**
  - [ ] **E1 (P1):** Single-Use Signed QR Generation — `feat/qr-generation`
  - [ ] **E2 (P1):** Download QR (PNG & PDF) — `feat/qr-download`
  - [ ] **E4 (P2):** QR Status Tracking — `feat/qr-status`
- **Pre-Installed Packages Used (Backend):** `qrcode`, `pdfkit` *(via `chore/wave3-deps`)*
- **Owned Files:**
  - Backend: `src/models/reservation.model.js` *(append `generate_qr_token`, `generate_qr_pdf_buffer`)*, `src/services/qr.service.js` (`generateQr`, `getQrStatus`), `src/controllers/api/reservation.controller.js` *(QR handlers)*
  - Frontend: `shared/components/qr-display/`, `features/reservations/reservation-details/`
- **Routes:** `GET /api/reservations/:id/qr`, `GET /api/reservations/:id/qr.png`, `GET /api/reservations/:id/qr.pdf`
- **Guardrail:** QR JWT contains **only** `{ res_id, ref }` signed with `QR_JWT_SECRET` (zero client PII).

### Track 3.2 — Manager QR Scanner & Atomic Entry (`F1 + F2`)
- **Assignee:** `@unassigned`
- **Stories & Branches:**
  - [ ] **F1 (P1):** QR Scanner (Camera, Image & PDF) — `feat/manager-qr-scanner`
  - [ ] **F2 (P1):** Post-Scan Details & Atomic Consumption — `feat/manager-qr-result`
- **Pre-Installed Packages Used (Backend):** `html5-qrcode`, `pdfjs-dist` *(via `chore/wave3-deps`)*
- **Owned Files:**
  - Backend: `src/middlewares/qr.middleware.js` (`verifyQrToken`), `src/models/reservation.model.js` *(append atomic `validate_entry`)*, `src/controllers/manager/managerScanner.controller.js`, `src/routes/manager/scanner.routes.js`
  - Views & JS: `src/views/manager/scanner.ejs`, `src/views/partials/scan-result.ejs`, `public/js/scanner-client.js`
- **Routes:** `GET /manager/scanner`, `POST /manager/qr/verify`
- **Guardrail:** Mark `qr_used: true` atomically with `findOneAndUpdate({ _id, status: 'CONFIRMED', qr_used: false }, ...)` to prevent race-condition double scans.

### Track 3.3 — Client Reservations List & Calendar (`G1 + C4`)
- **Assignee:** `@unassigned`
- **Stories & Branches:**
  - [ ] **G1 (P1):** Client My Reservations (Upcoming / Past) — `feat/client-my-reservations`
  - [ ] **C4 (P3):** Client Reservations Calendar — `feat/client-reservations-calendar`
- **Pre-Installed Packages Used (Frontend):** `angular-calendar` *(or `@fullcalendar/angular` fallback, via `chore/wave3-deps`)*
- **Owned Files:**
  - Backend: `src/routes/api/reservation.routes.js` *(verify `/me` is declared **before** `/:id`)*, `src/controllers/api/reservation.controller.js` *(client list & date-range query)*
  - Frontend: `features/reservations/my-reservations/`, `features/reservations/my-calendar/`
- **Routes:** `GET /api/reservations/me?status=upcoming|past`, `GET /api/reservations/me?from=&to=`

### Track 3.4 — Manager Room & Open Space Calendars (`G2 + G3`)
- **Assignee:** `@unassigned`
- **Stories & Branches:**
  - [ ] **G2 (P1):** Manager Per-Room Calendar — `feat/manager-room-calendar`
  - [ ] **G3 (P1):** Manager Open Space Availability — `feat/manager-open-space-availability`
- **Pre-Installed Packages Used:** FullCalendar via CDN *(no npm package required)*
- **Owned Files:**
  - Backend: `src/controllers/manager/managerCalendar.controller.js`, `src/routes/manager/calendar.routes.js`
  - Views & JS: `src/views/manager/calendar/{room,open-space}.ejs`, `public/js/calendar-room-client.js`
- **Routes:** `GET /manager/calendar/rooms/:roomId`, `GET /manager/api/rooms/:roomId/reservations?from=&to=`, `GET /manager/reservations/:id`, `GET /manager/calendar/open-space?date=`

### Track 3.5 — Automated Emails & Manager Dashboard (`D2 + E3 + H1`)
- **Assignee:** `@unassigned`
- **Stories & Branches:**
  - [ ] **D2 (P2):** Payment Receipt Email — `feat/payment-receipt-email`
  - [ ] **E3 (P2):** Send QR Code via Email — `feat/qr-email`
  - [ ] **H1 (P3):** Manager Statistics Dashboard — `feat/manager-dashboard`
- **Pre-Installed Packages Used (Backend):** `chart.js` *(via `chore/wave3-deps`; reuses `nodemailer` from Wave 2)*
- **Owned Files:**
  - Backend: `src/services/email.service.js` (`sendReceiptEmail`, `sendQrEmail`), `src/services/stripe.service.js` *(hook email calls after webhook confirmation)*, `src/controllers/manager/managerDashboard.controller.js`, `src/routes/manager/dashboard.routes.js`
  - Views & JS: `src/views/manager/dashboard.ejs`, `public/js/dashboard-charts.js`
- **Routes:** `GET /manager/dashboard`, `GET /manager/stats/revenue?from=&to=`, `GET /manager/stats/occupancy?roomId=`

---

## 4. Non-Negotiable PR Review Checklist

Every Pull Request into `develop` will be checked against these rules:

- [ ] **Lockfile hygiene:** No `npm install` run inside `feat/` branches; `package.json` and `package-lock.json` are untouched unless explicitly part of a `chore/waveX-deps` PR.
- [ ] **No `Manager` DB model:** Manager login uses `.env` only (`MANAGER_EMAIL` / `MANAGER_PASSWORD`).
- [ ] **Exact `snake_case` & `Client` naming:** Never rename locked schema fields or use `User` instead of `Client`.
- [ ] **Append to existing models:** Do not recreate or overwrite `backend/src/models/*.model.js` schemas created in `S1`.
- [ ] **Route ordering:** `GET /api/reservations/me` is declared **before** `GET /api/reservations/:id`.
- [ ] **Raw Stripe webhook:** `POST /api/payments/webhook` uses `express.raw({ type: 'application/json' })` **before** `app.use(express.json())`.
- [ ] **Express 5 safe:** No bare `'*'` route wildcards.
- [ ] **Explicit `.sort()` indexes:** Every field passed to `.sort()` is indexed in Mongoose.
- [ ] **Local verification passes:**
  - Backend: `cd backend && npm run dev` starts cleanly (`GET /api/health` → `200`).
  - Frontend: `cd frontend && npm run build` and `npx ng test --watch=false --browsers=ChromeHeadless` pass with zero errors.
- [ ] **Clean repo:** No `.env`, no `node_modules/`, and no test uploads committed.
