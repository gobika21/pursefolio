# PurseFolio

PurseFolio is a personal expense tracker with a Next.js (App Router) frontend and an Express/MongoDB backend, featuring JWT authentication, per-user budgets, multi-currency support, and an analytics dashboard.

## Project Structure

```
pursefolio/
├── backend/    # Express API, Mongoose models, JWT auth middleware
└── frontend/   # Next.js app (App Router, TypeScript, Tailwind CSS)
```

### Backend (`backend/`)

- `index.js` — Express app setup, CORS, MongoDB connection, route mounting, global error handler
- `routes/users.js` — auth and profile endpoints
- `routes/expenses.js` — expense CRUD endpoints
- `models/User.js` — user schema (email, password, currency, overall/category budgets)
- `models/Expense.js` — expense schema (title, amount, category, type, payment method, notes, date)
- `middleware/auth.js` — JWT verification (`requireAuth`)
- `lib/currencies.js` — supported currency codes

### Frontend (`frontend/`)

- `app/(landing)` — `page.tsx`, `about/page.tsx` — public marketing/landing pages
- `app/login`, `app/register` — auth pages
- `app/expenses/` — the authenticated app shell (guarded by `AuthGuard`), with pages for:
  - `home` — overview
  - `dashboard` — analytics/summary cards
  - `transactions` (+ `transactions/add`) — list and add transactions
  - `budgets` — overall and per-category budgets
  - `goals` — savings/spending goals
  - `categories` — category management
  - `analytics` — charts (`CategoryDonut`, `AreaTrendChart`)
  - `history` — historical records
  - `settings` — user/profile settings
- `app/expenses/components/` — shared UI (Sidebar, Topbar, StatCard, AddTransactionModal, Toast, etc.)
- `app/expenses/lib/` — client-side helpers (`api.ts`, `currency-context.tsx`, `add-transaction-context.tsx`, `format.ts`, `trend.ts`, `categories.ts`)
- `app/api/` — Next.js route handlers that proxy to the backend (`users/register`, `users/login`, `users/me`, `users/me/budgets`, `expenses`, `expenses/[id]`)

## Features

- **Authentication**: register/login with JWT, `requireAuth` middleware, rate-limited auth endpoints (`express-rate-limit`)
- **Expense tracking**: create, read, update, delete transactions with title, amount, category, type (`income`/`expense`), payment method, notes, and date
- **Budgets**: overall budget and per-category budgets, editable via `PATCH /api/users/me/budgets`
- **Multi-currency support**: user-level currency preference validated against a shared currency list (kept in sync between backend and frontend)
- **Analytics dashboard**: category breakdown (donut chart) and spending trend (area chart)
- **Health check**: `GET /health` reports API and MongoDB connection status

## API Overview

### Users (`/api/users`)

| Method | Endpoint         | Description                          | Auth |
|--------|------------------|---------------------------------------|------|
| POST   | `/register`      | Create a new user account             | No   |
| POST   | `/login`         | Authenticate and receive a JWT        | No   |
| GET    | `/me`            | Get current user profile              | Yes  |
| PATCH  | `/me`            | Update current user profile           | Yes  |
| PATCH  | `/me/budgets`    | Update overall/category budgets       | Yes  |

### Expenses (`/api/expenses`)

| Method | Endpoint | Description               |
|--------|----------|----------------------------|
| POST   | `/`      | Create an expense          |
| GET    | `/`      | List expenses              |
| GET    | `/:id`   | Get a single expense       |
| PUT    | `/:id`   | Update an expense          |
| DELETE | `/:id`   | Delete an expense          |

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file in `backend/` with:

```
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<a secret string for signing JWTs>
PORT=5000
FRONTEND_URL=http://localhost:3000
```

The API listens on `http://localhost:5000` by default; verify it's up via `GET /health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env.local` file in `frontend/` pointing at the backend API URL, then open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Express 5, MongoDB with Mongoose 9, JWT auth (`jsonwebtoken`), `bcrypt` for password hashing, `express-rate-limit` for auth throttling
