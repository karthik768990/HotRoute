# HotRoute

> HotRoute is a Next.js uptime monitoring and cold-start prevention platform built for endpoint health tracking and alerting.

## Project Title & An Engaging Overview

HotRoute provides a full-stack monitoring experience for developers and teams who need consistent endpoint availability and service readiness. Users can sign up, add service endpoints, configure polling intervals, and review health metrics in a protected dashboard.

### What this project solves

- Prevents cold start and idle endpoint issues by scheduling regular health checks.
- Centralizes uptime metrics, response time, and failure logs for user-managed services.
- Provides authentication, project management, and monitoring controls in a single web app.

---

## Core Features & Working Implementations

### Implemented features

- **User Authentication**
  - Email/password registration and login
  - Google OAuth sign-in
  - JWT-based auth token issuance
  - Email verification workflow
  - Password reset workflow
- **Project and endpoint management**
  - Create, update, delete monitored projects
  - Toggle monitoring active state per project
  - Validate URL and interval input on the backend
- **Monitoring runtime**
  - In-memory scheduler and worker pool for due pings
  - HTTP health checks using `undici`
  - Ping log creation and last ping timestamps
- **Dashboard and analytics**
  - Project list with recent ping logs
  - Per-project dashboard endpoints
  - User dashboard summary cards and recent incidents
- **Email flows**
  - Verification emails
  - Password reset emails
  - Resend integration via Resend API

### Application workflow

- The **frontend** is composed with **Next.js App Router**, client-side auth state, and protected routes under `src/app/(protected)`.
- **API routes** live under `src/app/api/` and use Next.js route handlers for auth, project, dashboard, and health endpoints.
- **JWT auth** is handled by `src/lib/auth/jwt.ts`; tokens are attached via Axios in `src/lib/api/client.ts`.
- **Prisma** manages database access with PostgreSQL via `src/lib/prisma.ts`.
- A lightweight runtime bootstrap in `src/lib/runtime/startup.ts` initializes a worker pool and scheduler.
- Email generation is handled by `src/lib/email/email.service.ts`, which builds verification and reset links from `APP_URL`.

---

## Tech Stack & Architecture

### Frontend

- Next.js `16.2.7`
- React `19.2.4`
- TypeScript
- Tailwind CSS
- `react-hook-form`
- `@tanstack/react-query`

### Backend

- Next.js Route Handlers
- `jsonwebtoken`
- `google-auth-library`
- `undici`
- `axios`

### Database

- PostgreSQL
- Prisma ORM `^7.8.0`
- Prisma client generated in `src/generated/prisma`

### Email

- Resend API via `resend`

### Tools

- ESLint
- Vitest
- Tailwind CSS

---

## Project Directory Structure

```text
.
├── .env
├── package.json
├── next.config.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── auth/
    │   │   ├── dashboard/
    │   │   ├── health/
    │   │   ├── projects/
    │   │   └── user/
    │   ├── (auth)/
    │   ├── (protected)/
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── layout/
    │   ├── project/
    │   └── ui/
    ├── generated/
    │   └── prisma/
    ├── lib/
    │   ├── api/
    │   ├── auth/
    │   ├── core/
    │   ├── dashboard/
    │   ├── email/
    │   ├── hooks/
    │   ├── runtime/
    │   ├── user/
    │   ├── user-dashboard/
    │   └── prisma.ts
    └── providers/
        ├── auth-provider.tsx
        ├── google-provider.tsx
        └── query-provider.tsx
```

### Folder responsibilities

- `src/app/` — Next.js pages and API route handlers, including auth and protected flows.
- `src/components/` — reusable UI components and page-specific interface blocks.
- `src/lib/api/` — shared API client, response helpers, and error mapping.
- `src/lib/auth/` — auth service logic, JWT creation/validation, password hashing, and Google OAuth.
- `src/lib/core/` — monitoring domain logic: project validation, ping execution, queue, worker pool, and scheduler.
- `src/lib/email/` — email templates and Resend email delivery integration.
- `src/lib/runtime/` — bootstrap code for scheduler and worker pool.
- `src/lib/prisma.ts` — Prisma client initialization and adapter configuration.
- `src/providers/` — React context providers for auth, Google OAuth, and query client.

---

## Getting Started (Prerequisites & Installation)

### Prerequisites

- Node.js 20+ with npm
- PostgreSQL database

### Install

```bash
git clone https://github.com/karthik768990/HotRoute.git
cd HotRoute
npm install
```

### Required environment variables

Create a `.env` file in the repository root with:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET_KEY="<your-jwt-secret>"
RESEND_API_KEY="<your-resend-api-key>"
APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="<google-client-id>"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="<google-client-id>"
GOOGLE_CLIENT_SECRET="<google-client-secret>"
```

> `APP_URL` is used to build email verification and password reset links.

---

## Usage & Running Locally

### Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

### Build and start production

```bash
npm run build
npm start
```

### Run tests

```bash
npm test
```

### Prisma generate

```bash
npx prisma generate
```

---

## Future Roadmap / To-Do

- Replace the current in-memory scheduler and queue with a durable external queue service.
- Add stronger request validation at the API route boundary.
- Harden auth storage and token handling beyond localStorage-based JWT usage.
- Add integration and end-to-end tests for API routes and dashboard workflows.
- Introduce ping log retention or cleanup for long-running usage.

---

## Notes

- This project currently boots a worker pool and scheduler in-process via `src/lib/runtime/startup.ts`.
- Email delivery is handled through Resend and requires a valid `RESEND_API_KEY`.
- Google sign-in is enabled by providing both server-side `GOOGLE_CLIENT_ID` and client-side `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
