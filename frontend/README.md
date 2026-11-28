# Salle Atlas — Frontend (Angular 18 + Angular Material)

Client-facing Single Page Application (SPA) for searching coworking spaces, booking rooms or open-space seats, paying via Stripe Checkout, and viewing/downloading QR entry passes.

> **Scope note:** This app is strictly for **Clients**. The Manager Back-Office is server-rendered with EJS inside `backend/src/views/` and does not live in this Angular workspace.

---

## 1. Quick Start (Local Development)

### Prerequisites
- **Node.js** (LTS) & **npm**
- **Backend API** running locally on `http://localhost:5000` (`cd backend && npm run dev`)

### Install & Run
~~~bash
cd frontend
npm install
npm start
~~~

Open `http://localhost:4200`.

### NPM Scripts
| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm start` | `ng serve` | Local dev server on `http://localhost:4200` with live reload |
| `npm run build` | `ng build` | Production build (outputs static files to `dist/frontend/`) |
| `npm test` | `ng test` | Run Karma + Jasmine unit tests in watch mode |
| `npx ng test --watch=false --browsers=ChromeHeadless` | — | Single-run headless test check (CI / pre-PR) |

*(Linux note: if Karma cannot find Chrome, run `export CHROME_BIN=$(which chromium || which google-chrome || which brave-browser)` first.)*

---

## 2. Environments (`src/environments/`)

Angular 18 uses `environment.development.ts` during `ng serve` and swaps in `environment.ts` during `ng build` (configured in `angular.json`).

| File | Usage | `apiUrl` |
| :--- | :--- | :--- |
| `src/environments/environment.development.ts` | Local dev (`npm start`) | `http://localhost:5000/api` |
| `src/environments/environment.ts` | Production (`npm run build`) | Deployed backend API URL |

Always import `environment` from `src/environments/environment` (never import `.development.ts` directly) so Angular's `fileReplacements` works automatically.

---

## 3. Non-Negotiable Guardrails (Read Before Coding)

Breaking any of these will fail PR review:

1. **Standalone Architecture Only:** This app uses Angular 18 standalone components, functional interceptors (`HttpInterceptorFn`), and functional guards (`CanActivateFn`). Do **not** create `NgModule` files.
2. **Exact `snake_case` Model Fields:** All interfaces in `src/app/core/models/` mirror the backend Mongoose schemas and UML diagram 1-to-1 (`first_name`, `space_type`, `price_per_hour`, `number_of_people`, etc.). Do **not** rename them to `camelCase`.
3. **Use `Client`, Never `User`:** Customer state, services, and types always reference `Client` (`core/models/client.model.ts`).
4. **Functional Auth Wiring (US A2):**
   - Attach the `Authorization: Bearer <token>` header inside `src/app/core/interceptors/auth.interceptor.ts` (already registered in `app.config.ts`).
   - Protect authenticated routes (`/booking/...`, `/my-reservations`, `/reservations/:id`, `/my-calendar`) with `src/app/core/guards/auth.guard.ts`.
5. **Never Trust Stripe Redirect Alone (US D1):** Landing on `/payment-success` does **not** prove payment succeeded. Always call `GET /api/reservations/:id` to verify `status === 'CONFIRMED'` (polling briefly if the Stripe webhook is still processing).
6. **UI Consistency:** Use **Angular Material** (`azure-blue` theme, already configured in `angular.json` and `styles.scss`) rather than mixing in Bootstrap or another component library.
7. **No Manager Views Here:** All `/manager/...` pages are EJS templates in `backend/`.

---

## 4. Folder Structure

~~~text
frontend/
├── angular.json                       # Workspace config, Material theme, env fileReplacements
├── package.json                       # Angular 18 + Angular Material dependencies
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss                    # Global styles & Material typography
    ├── environments/
    │   ├── environment.development.ts # Dev API URL (http://localhost:5000/api)
    │   └── environment.ts             # Production API URL
    └── app/
        ├── app.config.ts              # Router, HttpClient + authInterceptor, Animations
        ├── app.routes.ts              # Lazy/standalone route definitions
        ├── app.component.{ts,html,scss,spec.ts}
        ├── core/
        │   ├── models/                # Locked UML TypeScript interfaces (snake_case)
        │   ├── services/              # auth, space, reservation, payment HTTP services
        │   ├── guards/                # auth.guard.ts (A2)
        │   └── interceptors/          # auth.interceptor.ts (stubbed in S2, completed in A2)
        ├── shared/
        │   └── components/
        │       ├── navbar/            # Material toolbar shell (S2)
        │       ├── search-filters/    # Filter bar with RxJS debounce (C3)
        │       └── qr-display/        # QR code viewer + status badge (E1, E4)
        └── features/
            ├── auth/                  # register (A1), login (A2), forgot/reset-password (A4)
            ├── spaces/                # search, search-results, room-details (C1)
            ├── booking/               # booking-confirm (C2), payment-success/failed (D1)
            └── reservations/          # my-reservations (G1), reservation-details (E2/E4), my-calendar (C4)
~~~

---

## 5. Locked TypeScript Models (`src/app/core/models/`)

All 7 UML interfaces are already created and match the backend JSON payloads:

| File | Exported Types |
| :--- | :--- |
| `client.model.ts` | `Client` |
| `equipment.model.ts` | `Equipment` |
| `space.model.ts` | `Space`, `SpaceType` (`'room' \| 'open_space'`) |
| `room.model.ts` | `Room` (extends `Space`) |
| `open-space.model.ts` | `OpenSpace` (extends `Space`, includes optional `remaining_seats`) |
| `reservation.model.ts` | `Reservation`, `ReservationStatus` (`'PENDING' \| 'CONFIRMED' \| 'EXPIRED'`), `QrStatus` (`'VALID' \| 'USED' \| 'EXPIRED'`) |
| `payment.model.ts` | `Payment`, `PaymentStatus` (`'PENDING' \| 'SUCCESSFUL' \| 'FAILED'`) |

---

## 6. Packages Installed Per Story

Only install packages when you pick up the story that introduces them:

- **S2 (Installed):** `@angular/material` *(includes Material Datepicker, Toolbar, Buttons, Forms, Tabs, etc.)*
- **C1:** `date-fns`
- **C4:** `angular-calendar` *(uses `date-fns` from C1)*

---

## 7. Frontend User Stories Quick Reference

| Story | Feature Folder / Shared Component | Consumed Backend Endpoints |
| :--- | :--- | :--- |
| **A1** | `features/auth/register` | `POST /api/auth/register` |
| **A2** | `features/auth/login`, `auth.guard`, `auth.interceptor` | `POST /api/auth/login`, `GET /api/auth/me` |
| **A4** | `features/auth/forgot-password`, `reset-password` | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password/:token` |
| **C1** | `features/spaces/{search,search-results,room-details}` | `GET /api/spaces/available`, `GET /api/rooms/:id` |
| **C2** | `features/booking/booking-confirm` | `POST /api/reservations` |
| **C3** | `shared/components/search-filters` (RxJS debounce) | `GET /api/spaces/available?...`, `GET /api/equipments` |
| **C4** | `features/reservations/my-calendar` | `GET /api/reservations/me?from=&to=` |
| **D1** | `features/booking/{payment-success,payment-failed}` | `POST /api/payments/checkout-session`, `GET /api/reservations/:id` |
| **E1** | `shared/components/qr-display` | `GET /api/reservations/:id/qr` |
| **E2** | `features/reservations/reservation-details` (PNG/PDF buttons) | `GET /api/reservations/:id/qr.png`, `/qr.pdf` |
| **E4** | Status badge (`VALID` / `USED` / `EXPIRED`) | `GET /api/reservations/:id` |
| **G1** | `features/reservations/my-reservations` (Upcoming / Past tabs) | `GET /api/reservations/me?status=upcoming\|past` |

---

## 8. Git Workflow for Contributors

Always branch from **`develop`** (never commit directly to `develop` or `main`) and open a Pull Request back into **`develop`**:

~~~bash
git checkout develop
git pull origin develop
git checkout -b feat/<story-branch-name>   # e.g., feat/auth-login
~~~

### Before Opening a PR
1. `npm run build` completes with zero TypeScript or template errors.
2. `npx ng test --watch=false --browsers=ChromeHeadless` passes.
3. No hardcoded `localhost` URLs inside services (always use `environment.apiUrl`).
4. Reference your User Story ID in the PR title (e.g., `feat(A2): client login, auth guard, and JWT interceptor`).
