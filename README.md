# HotRoute

> HotRoute is a high-performance, full-stack endpoint health monitoring, latency tracking, and cold-start prevention platform engineered with Next.js 16 (App Router), TypeScript, PostgreSQL, and Prisma.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [High-Level Architecture](#high-level-architecture)
- [Request Lifecycle](#request-lifecycle)
- [Scheduler & Worker Architecture](#scheduler--worker-architecture)
- [Database Design](#database-design)
- [Security Implementation](#security-implementation)
- [Rate Limiting](#rate-limiting)
- [Performance Optimizations](#performance-optimizations)
- [Scalability Considerations](#scalability-considerations)
- [Testing Suite](#testing-suite)
- [CI/CD Pipeline](#cicd-pipeline)
- [API Documentation](#api-documentation)
- [Installation & Local Setup](#installation--local-setup)
- [Environment Variables](#environment-variables)
- [Project Directory Structure](#project-directory-structure)
- [Key Engineering Decisions](#key-engineering-decisions)
- [Future Roadmap](#future-roadmap)

---

## Project Overview

### Problem Statement
Modern microservices and serverless infrastructure (e.g., Vercel Functions, Render Web Services, Supabase, Neon, Railway) automatically spin down or enter sleep states after periods of inactivity. This leads to severe **cold-start latency spikes** for downstream users and unmonitored service outages.

### Solution
**HotRoute** provides real-time availability tracking, response time analytics, and active cold-start prevention. By executing automated background HTTP health checks at configurable intervals, HotRoute keeps endpoints warm, records time-series latency data, computes uptime metrics, and alerts developers to incidents.

### Target Audience
Developers, SaaS founders, and DevOps engineers managing APIs, webhooks, or serverless microservices who require continuous uptime tracking and minimal cold-start latency.

---

## Key Features

- **Authentication & User Management**
  - Stateless JWT-based authentication (7-day token validity).
  - Secure password hashing using `bcryptjs` with salt rounds.
  - Google OAuth 2.0 single sign-in integration (`@react-oauth/google` and `google-auth-library`).
  - Email verification and password reset token workflows powered by Resend API.
  - User profile management and secure password updates.

- **Endpoint Monitoring & Management**
  - Full CRUD management for monitored endpoints.
  - Configurable polling intervals (in minutes) and active/inactive toggles.
  - Input URL protocol validation (HTTP/HTTPS) and SSRF protection (rejecting loopback, IPv6, cloud metadata, and RFC 1918 private network IPs).
  - Manual ping execution on demand for real-time status checks.

- **High-Performance Background Scheduler & Worker Pool**
  - Database-driven scheduler that queries PostgreSQL for due projects using raw SQL date arithmetic (`lastPingAt + interval <= NOW()`), avoiding memory bloat.
  - Decoupled in-memory job queue (`InMemoryQueue`) and worker pool (`WorkerPool`).
  - Asynchronous HTTP health checks powered by Node.js native high-performance client `undici`.

- **Global & Project Dashboard Analytics**
  - **Global Dashboard**: Aggregates total projects, active percentage, overall uptime percentage, average response time, and recent failure logs across all user endpoints in a single SQL query.
  - **Project Dashboard**: Granular timeline history (last 50 ping logs), uptime calculation, response time averages, and current status (`UP`, `DOWN`, `UNKNOWN`).

- **API Hardening & Security**
  - IP-based sliding-window rate limiting on public authentication routes.
  - Strict input validation schemas via Zod (`api.validation.ts`).
  - Standard HTTP security response headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`).
  - Production error response sanitization to prevent internal stack trace leakage.

---

## Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js `16.2.7` (App Router) | Server & Client Components, modern routing architecture |
| **UI Core** | React `19.2.4` / TypeScript `^5` | Strict static typing, React Compiler optimization |
| **Styling & UI** | Tailwind CSS v4, Framer Motion | Modern design system with animations |
| **State & Data Fetching** | TanStack React Query `^5`, Axios | Server-state caching and HTTP client interceptors |
| **Form Handling** | React Hook Form, Zod | Type-safe form validation |
| **Backend Framework** | Next.js 16 Route Handlers | Node.js runtime API routes |
| **HTTP Client (Ping)** | `undici` `^8.4.1` | Native high-throughput HTTP client for health checks |
| **Database** | PostgreSQL | Relational time-series ping log storage |
| **ORM** | Prisma ORM `^7.8.0` (`@prisma/adapter-pg`) | Type-safe query builder & native driver adapter |
| **Authentication** | `jsonwebtoken`, `bcryptjs`, `google-auth-library` | Stateless JWTs, bcrypt hashing, Google OAuth |
| **Email Delivery** | Resend API (`resend` SDK) | Transactional email delivery for verification & resets |
| **Testing** | Vitest `^4.1.8` | Fast unit & integration test runner |
| **CI/CD** | GitHub Actions | Automated build, linting, type-checking, & test pipeline |

---

## High-Level Architecture

```text
               ┌─────────────────────────────────────────────────────────┐
               │                     React Client                        │
               │         (Next.js App Router / React Query)              │
               └────────────────────────────┬────────────────────────────┘
                                            │
                                  HTTP (JSON / REST API)
                                            │
                                            ▼
               ┌─────────────────────────────────────────────────────────┐
               │                Next.js 16 API Layer                     │
               │  (/api/auth, /api/projects, /api/dashboard, /api/user)  │
               └────────────┬───────────────────────────────┬────────────┘
                            │                               │
                Authentication Middleware          Zod Payload Validation
                (JWT Verification & IDOR Checks)     (api.validation.ts)
                            │                               │
                            └───────────────┬───────────────┘
                                            │
                                            ▼
               ┌─────────────────────────────────────────────────────────┐
               │                 Service Domain Layer                    │
               │   (auth.service, project.service, dashboard.service)    │
               └────────────┬───────────────────────────────┬────────────┘
                            │                               │
                     Prisma / Raw SQL                       │
                            │                               ▼
                            ▼                     ┌──────────────────┐
               ┌─────────────────────────┐        │ Background Boot  │
               │   PostgreSQL Database   │        └─────────┬────────┘
               │ (Projects, PingLogs,    │                  │
               │  Users, Tokens)         │                  ▼
               └────────────▲────────────┘        ┌──────────────────┐
                            │                     │    Scheduler     │
                            │ (Persist Logs)      └─────────┬────────┘
                            │                               │ (Due Project IDs)
                            │                               ▼
               ┌────────────┴────────────┐        ┌──────────────────┐
               │      Worker Pool        │◄───────│  InMemoryQueue   │
               │  (Undici Ping Execution)│        └──────────────────┘
               └────────────┬────────────┘
                            │
                      HTTP GET Ping
                            │
                            ▼
               ┌─────────────────────────┐
               │ Target User Endpoint    │
               │ (External Service)      │
               └─────────────────────────┘
```

---

## Request Lifecycle

Every incoming HTTP request to HotRoute undergoes a structured, multi-tier processing pipeline:

```text
 Client Request
       │
       ▼
 [1] Security Headers & Rate Limiting Middleware
     (Checks IP against sliding-window token bucket in rate-limit.ts)
       │
       ▼
 [2] Route Handler Entry (Next.js API Route)
       │
       ▼
 [3] Authentication & Ownership Check
     (verifyToken decodes JWT; requireAuthorizedProject verifies user ownership)
       │
       ▼
 [4] Request Body / Parameter Validation
     (Zod schema parses payload; returns 400 Bad Request if invalid)
       │
       ▼
 [5] Service Layer Execution
     (Executes business logic in project.service, auth.service, etc.)
       │
       ▼
 [6] Database Query (Prisma ORM / Parameterized $queryRaw)
       │
       ▼
 [7] Response Serialization & Error Handling
     (Success payload formatted; 500 errors sanitized before returning to client)
```

---

## Scheduler & Worker Architecture

The background monitoring engine relies on an optimized, decoupled polling pipeline composed of three distinct modules:

```text
  PostgreSQL Database
          │
          │ SELECT id FROM "Project" WHERE "active" = true AND
          │ ("lastPingAt" IS NULL OR "lastPingAt" + ("interval" * INTERVAL '1 minute') <= NOW())
          │
          ▼
┌──────────────────┐      Enqueue Job      ┌──────────────────┐
│    Scheduler     ├──────────────────────►│  InMemoryQueue   │
└──────────────────┘                       └────────┬─────────┘
                                                    │
                                            Dequeue │ Job
                                                    ▼
┌──────────────────┐   Execute Health Check ┌──────────────────┐
│  Target Endpoint │◄───────────────────────┤   Worker Pool    │
└────────┬─────────┘    (undici HTTP Client)└────────┬─────────┘
         │                                           │
         └───────────────────► Persist Log ──────────┘
                             ("PingLog" & "lastPingAt")
```

### 1. PostgreSQL-Driven Scheduling (`scheduler.service.ts`)
Rather than pulling all active projects into Node.js application memory, the scheduler delegates due-project filtering directly to PostgreSQL using raw SQL date arithmetic:

```sql
SELECT id, interval, "lastPingAt"
FROM "Project"
WHERE "active" = true
  AND (
    "lastPingAt" IS NULL
    OR "lastPingAt" + ("interval" * INTERVAL '1 minute') <= NOW()
  );
```

### 2. Queue Decoupling (`queue.memory.ts`)
Due project IDs are pushed into `InMemoryQueue`. This abstraction decouples scheduler polling cycles from job execution and provides a clean interface for future distributed queue implementations (e.g., Redis/BullMQ).

### 3. Asynchronous Worker Pool Execution (`worker-pool.ts` & `ping.service.ts`)
- Worker threads dequeue project IDs and execute HTTP health checks using Node's high-throughput `undici` client.
- The response time (in milliseconds), HTTP status code, and success flag are recorded in a new `PingLog` entry.
- The `Project.lastPingAt` timestamp is updated in PostgreSQL.

---

## Database Design

HotRoute utilizes PostgreSQL as its primary datastore, managed via Prisma ORM.

```text
  ┌──────────────────────────┐             ┌──────────────────────────┐
  │           User           │             │         Project          │
  ├──────────────────────────┤             ├──────────────────────────┤
  │ id          (PK, String) │1           *│ id          (PK, String) │
  │ username         (String)├────────────►│ name            (String) │
  │ email     (Unique,String)│             │ url             (String) │
  │ password   (Nullable,Str)│             │ interval         (Int)   │
  │ googleId  (Unique,String)│             │ active         (Boolean) │
  │ verifiedAt    (DateTime) │             │ lastPingAt    (DateTime) │
  │ createdAt     (DateTime) │             │ userId      (FK, String) │
  └────────────┬─────────────┘             └────────────┬─────────────┘
               │                                        │
               │1                                       │1
               │                                        │
               │*                                       │*
  ┌────────────┴─────────────┐             ┌────────────┴─────────────┐
  │    VerificationToken     │             │         PingLog          │
  ├──────────────────────────┤             ├──────────────────────────┤
  │ id          (PK, String) │             │ id          (PK, String) │
  │ token     (Unique,String)│             │ statusCode     (Int,Null)│
  │ userId      (FK, String) │             │ errorMessage (Nullable)  │
  │ expiresAt     (DateTime) │             │ responseTime      (Int)  │
  └──────────────────────────┘             │ success        (Boolean) │
                                           │ projectId   (FK, String) │
  ┌──────────────────────────┐             │ createdAt     (DateTime) │
  │    PasswordResetToken    │             └──────────────────────────┘
  ├──────────────────────────┤
  │ id          (PK, String) │             Indexes & Constraints:
  │ token     (Unique,String)│             • @@unique([userId, url])
  │ userId      (FK, String) │             • @@index([projectId, createdAt])
  │ expiresAt     (DateTime) │             • @@index([userId]) on Tokens
  └──────────────────────────┘
```

### Key Schema Features
1. **Time-Series Indexing**: `PingLog` features a composite index `@@index([projectId, createdAt])` to ensure fast latency aggregation and history queries.
2. **Project URL Uniqueness**: `@@unique([userId, url])` prevents duplicate endpoint entries for the same account while allowing different users to monitor identical URLs.
3. **Cascading Deletes**: `onDelete: Cascade` ensures that deleting a user or project automatically cleans up associated ping logs and tokens without leaving orphaned records.

---

## Security Implementation

Security is built directly into every layer of the HotRoute architecture:

### Authentication & Passwords
- **Bcrypt Hashing**: User passwords are hashed using `bcryptjs` before storage. Plaintext passwords are never logged or persisted.
- **Stateless JWTs**: Tokens are signed using `jsonwebtoken` with a 7-day expiration (`expiresIn: '7d'`) and verified on every protected route via `verifyToken()`.

### Authorization & IDOR Protection
- **Ownership Verification**: All project operations (Get, Update, Delete, Ping, Analytics) enforce ownership checks via `requireAuthorizedProject` (`project.userId === user.id`) or explicit Prisma `where: { userId }` clauses. Changing a `projectId` in route parameters will never expose or mutate another user's project.

### Input Sanitization & SSRF Defense
- **Zod Validation**: All POST/PATCH request bodies are validated using Zod schemas (`api.validation.ts`).
- **SSRF Defense**: Endpoint creation validates URLs using `validateProjectUrl()` to reject loopback addresses (`127.0.0.1`, `localhost`), IPv6 loopbacks (`::1`), cloud metadata endpoints (`169.254.169.254`), and private networks (`10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`).

### Parameterized SQL Queries
- All custom database queries use Prisma's tagged template literal `prisma.$queryRaw\`...\``, which automatically parameterizes all dynamic inputs, preventing SQL injection.

### Response Sanitization & HTTP Headers
- **500 Error Shielding**: Production 500 responses return a generic `"An internal server error occurred"` message to external clients, suppressing raw Prisma/PostgreSQL exception messages and internal stack traces.
- **Security Headers**: `next.config.ts` injects standard HTTP security headers:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## Rate Limiting

HotRoute implements an IP-based sliding-window rate limiter (`rate-limit.ts`) to prevent brute-force credential stuffing and API abuse.

| Endpoint | Window | Limit | Target Abuse Scenario Prevented |
| :--- | :--- | :--- | :--- |
| `POST /api/auth/login` | 1 minute | 10 requests | Password brute-force & credential stuffing |
| `POST /api/auth/register` | 1 minute | 10 requests | Account creation spam & DB exhaustion |
| `POST /api/auth/forgot-password` | 1 minute | 5 requests | Password reset email spamming |
| `POST /api/auth/reset-password` | 1 minute | 5 requests | Token brute-forcing |
| `POST /api/auth/resend-verification` | 1 minute | 5 requests | Verification email quota exhaustion |

Requests exceeding these limits receive an HTTP `429 Too Many Requests` response.

---

## Performance Optimizations

1. **PostgreSQL-Side Scheduler Filtering**: Replaced full project table scans with a targeted SQL query (`lastPingAt + interval <= NOW()`), reducing memory consumption from $O(N)$ to $O(\text{due projects})$.
2. **Single-Query Global Dashboard Aggregation**: The global user dashboard aggregates total projects, active count, status (`UP`/`DOWN`/`UNKNOWN`), uptime %, and average response time in PostgreSQL via a single `$queryRaw` query utilizing `LATERAL` joins and `FILTER (WHERE success = true)`.
3. **Prisma Field Selection**: Queries for recent incidents use Prisma `select` clauses to retrieve only essential scalar fields (`projectId`, `statusCode`, `errorMessage`, `createdAt`, `project.name`), avoiding heavy object graphs.
4. **Time-Series Indexing**: Indexed `(projectId, createdAt)` on `PingLog` ensures $O(\log N)$ lookup performance for ping histories and latency analytics.

---

## Scalability Considerations

- **Stateless API Routes**: Next.js route handlers carry no session state. Authentication relies strictly on JWT verification, making the API layer horizontally scalable across serverless containers.
- **Decoupled Queue Abstraction**: `InMemoryQueue` isolates scheduler detection from worker execution, allowing seamless replacement with distributed queue systems (e.g., Redis / BullMQ) for multi-node worker clusters.
- **Database Load Reduction**: Offloading filtering and aggregation to PostgreSQL indexing minimizes Node.js CPU cycles and Garbage Collection overhead.

---

## Testing Suite

HotRoute includes a comprehensive Vitest test suite covering unit, integration, and service-layer behaviors.

### Running Tests

```bash
# Run all vitest tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Isolation
Tests utilize a dedicated schema (`&schema=test`) defined in `.env.test`. Global setup scripts automatically migrate and wipe the test database before test execution, ensuring zero contamination of development data.

---

## CI/CD Pipeline

HotRoute uses GitHub Actions (`.github/workflows/ci.yml`) to enforce code quality on every `push` or `pull_request` to `main` and `develop` branches:

```text
GitHub Push / Pull Request
       │
       ▼
 [1] Checkout Repository & Setup Node 22
       │
       ▼
 [2] Spin Up PostgreSQL 16 Service Container
       │
       ▼
 [3] Install Dependencies (npm ci)
       │
       ▼
 [4] Generate Prisma Client & Run Database Migrations
       │
       ▼
 [5] Run TypeScript Static Analysis (npx tsc --noEmit)
       │
       ▼
 [6] Execute Vitest Test Suite (npx vitest run)
       │
       ▼
 [7] Verify Production Build (npm run build)
```

---

## API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public (Rate Limited) | Register a new user account |
| `POST` | `/api/auth/login` | Public (Rate Limited) | Authenticate user & issue JWT |
| `POST` | `/api/auth/google` | Public | Authenticate / register via Google OAuth |
| `POST` | `/api/auth/forgot-password` | Public (Rate Limited) | Send password reset token email |
| `POST` | `/api/auth/reset-password` | Public (Rate Limited) | Reset user password using token |
| `POST` | `/api/auth/verify-email` | Public | Verify email address using token |
| `POST` | `/api/auth/resend-verification` | Public (Rate Limited) | Resend verification token email |
| `GET` | `/api/auth/me` | Protected (JWT) | Get authenticated user profile |
| `POST` | `/api/auth/logout` | Protected (JWT) | Client-side session logout |

### Projects (`/api/projects`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Protected (JWT) | List all projects owned by user |
| `POST` | `/api/projects` | Protected (JWT) | Create a new monitored project |
| `GET` | `/api/projects/[projectId]` | Protected (JWT + Ownership) | Get project details by ID |
| `PATCH` | `/api/projects/[projectId]` | Protected (JWT + Ownership) | Update project name, URL, or interval |
| `DELETE` | `/api/projects/[projectId]` | Protected (JWT + Ownership) | Delete project and associated logs |
| `POST` | `/api/projects/[projectId]/ping` | Protected (JWT + Ownership) | Execute manual HTTP ping on demand |
| `GET` | `/api/projects/[projectId]/dashboard` | Protected (JWT + Ownership) | Get detailed project analytics & history |

### User Profile & System (`/api/user`, `/api/dashboard`, `/api/health`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Protected (JWT) | Get global user dashboard metrics |
| `PATCH` | `/api/user` | Protected (JWT) | Update username or email |
| `POST` | `/api/user/password` | Protected (JWT) | Update account password |
| `GET` | `/api/health` | Public | Service health probe |

---

## Installation & Local Setup

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL database instance

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/karthik768990/HotRoute.git
cd HotRoute
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hotroute_dev?sslmode=disable"
JWT_SECRET_KEY="your-super-secret-jwt-key"
RESEND_API_KEY="re_123456789"
APP_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="your-google-client-id"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Setup & Prisma Generation
```bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Yes | Secret key used for signing and verifying JWT tokens |
| `RESEND_API_KEY` | Yes | Resend API key for transactional emails |
| `APP_URL` | Yes | Base application URL used for email links (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Optional | Server-side Google OAuth Client ID |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional | Public Google OAuth Client ID for React OAuth button |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth Client Secret |

---

## Project Directory Structure

```text
HotRoute/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI pipeline configuration
├── prisma/
│   ├── migrations/              # PostgreSQL schema migration history
│   └── schema.prisma            # Prisma data models & database schema
├── src/
│   ├── app/                     # Next.js App Router pages & API routes
│   │   ├── (auth)/              # Public authentication pages (login, register)
│   │   ├── (protected)/         # Protected dashboard & project pages
│   │   └── api/                 # Next.js route handlers
│   │       ├── auth/            # Auth API routes
│   │       ├── dashboard/       # Global dashboard API route
│   │       ├── health/          # Health probe API route
│   │       ├── projects/        # Project CRUD & ping API routes
│   │       └── user/            # User profile API routes
│   ├── components/              # React UI components
│   │   ├── auth/                # Auth form components
│   │   ├── dashboard/           # Dashboard visual components & metrics
│   │   ├── layout/              # Navigation bar & layout wrappers
│   │   ├── project/             # Project drawers & control dialogs
│   │   └── ui/                  # Reusable UI component library
│   ├── lib/                     # Service domain logic & core utilities
│   │   ├── analytics/           # Uptime & latency aggregation services
│   │   ├── api/                 # Axios client, error mapping, rate-limiting, & validation
│   │   ├── auth/                # Auth services, JWT verification, & bcrypt helpers
│   │   ├── background/          # Scheduler, InMemoryQueue, worker pool, &undici HTTP client
│   │   ├── dashboards/          # Global & project dashboard services
│   │   ├── email/               # Resend email templates & delivery services
│   │   ├── ping/                # Ping execution service
│   │   ├── projects/            # Project CRUD services & SSRF validation
│   │   ├── user/                # User profile update services
│   │   └── prisma.ts            # Prisma client singleton instance
│   └── providers/               # React Context Providers (Auth, Google, Query Client)
├── next.config.ts               # Next.js configuration & HTTP security headers
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript configuration
└── vitest.config.ts             # Vitest test suite configuration
```

---

## Key Engineering Decisions

1. **Service Layer Pattern**: Extracted all business logic out of API route handlers into modular services (`project.service.ts`, `auth.service.ts`, `user.service.ts`). Route handlers strictly perform rate limiting, authentication, payload parsing, and error mapping.
2. **Prisma ORM with Parameterized `$queryRaw`**: Used Prisma ORM for standard CRUD operations to maintain type safety. Where complex aggregations or date arithmetic were required (`scheduler` and `user-dashboard`), parameterized `$queryRaw` template strings were used to leverage PostgreSQL engine optimizations without compromising query safety.
3. **Decoupled Queue & Worker Pool**: Rather than executing HTTP health checks inside the scheduler loop, jobs are enqueued into an `InMemoryQueue` and processed by a worker pool. This isolates scheduling overhead from Network I/O latency.
4. **Strict SSRF Target Defense**: Integrated IP range and hostname checks in `project.service.ts` to prevent attackers from using HotRoute as a proxy to scan internal networks or cloud metadata APIs.

---

## Future Roadmap

- [ ] **Distributed Task Queue**: Replace `InMemoryQueue` with Redis and BullMQ to support multi-node worker clusters.
- [ ] **`nextPingAt` Indexing**: Add a calculated, indexed `nextPingAt` column on `Project` to enable $O(1)$ database index scans for due projects.
- [ ] **Multi-Channel Alerting**: Add Slack, Discord webhook, and PagerDuty alert integrations for instant failure notifications.
- [ ] **Metrics & Observability**: Integrate Prometheus metrics endpoints and OpenTelemetry trace collection.
