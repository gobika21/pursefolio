# PurseFolio

PurseFolio is an expense tracker application with a Next.js frontend and an Express/MongoDB backend.

## Project Structure

```
pursefolio/
├── backend/    # Express API, MongoDB models, auth middleware
└── frontend/   # Next.js app (App Router)
```

## Features

- User authentication (register/login)
- Expense tracking with transactions and categories
- Analytics dashboard with charts
- Multi-currency support
- Export transactions to Excel

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file in `backend/` with the required environment variables (e.g. `MONGODB_URI`, `JWT_SECRET`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Express, MongoDB (Mongoose), JWT auth, bcrypt
