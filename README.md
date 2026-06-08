# HotRoute

> Keep your services warm.

HotRoute is a cold-start prevention and service monitoring platform that keeps web applications responsive by sending scheduled health-check requests. Users can register endpoints, configure ping intervals, monitor response metrics, and track service health from a centralized dashboard.

---

# Features

## Authentication

* User Registration
* User Login
* JWT Authentication
* Protected Routes

## Project Management

* Add Endpoint
* Edit Endpoint
* Delete Endpoint
* Enable / Disable Monitoring

## Monitoring

* Automated Scheduled Pings
* Response Time Tracking
* Status Code Tracking
* Ping History Logs
* Last Successful Ping

## Dashboard

* Total Monitored Services
* Active Services
* Recent Activity
* Health Status Overview

---

# Tech Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS

## Backend

* Next.js Route Handlers
* JWT Authentication

## Database

* PostgreSQL
* Prisma ORM

## Scheduling

* Cron Jobs (V1)
* Worker Infrastructure (Future)

---

# System Architecture

```mermaid
flowchart TB

    User[User]

    subgraph Frontend
        Dashboard[Next.js Dashboard]
    end

    subgraph Backend
        API[API Routes]
        Auth[JWT Authentication]
    end

    subgraph Database
        DB[(PostgreSQL)]
    end

    subgraph Scheduler
        Cron[Cron Scheduler]
        Worker[Ping Worker]
    end

    subgraph External
        Websites[Target Websites]
    end

    User --> Dashboard

    Dashboard --> API

    API --> Auth
    API --> DB

    Cron --> Worker

    Worker --> Websites
    Worker --> DB

    API --> Worker
```

---

# Database Architecture

```mermaid
erDiagram

    User ||--o{ Project : owns
    Project ||--o{ PingLog : generates

    User {
        string id
        string username
        string email
        string password
        datetime createdAt
    }

    Project {
        string id
        string userId
        string name
        string url
        int interval
        boolean active
        datetime lastPingAt
        datetime createdAt
    }

    PingLog {
        string id
        string projectId
        int statusCode
        int responseTime
        boolean success
        datetime createdAt
    }
```

---

# Request Flow

```mermaid
sequenceDiagram

    participant User
    participant Dashboard
    participant API
    participant Database
    participant Worker
    participant Website

    User->>Dashboard: Register Endpoint

    Dashboard->>API: Create Project

    API->>Database: Store Project

    Database-->>API: Success

    API-->>Dashboard: Created

    loop Scheduled Interval

        Worker->>Website: Send Ping

        Website-->>Worker: Response

        Worker->>Database: Store Ping Log

    end

    User->>Dashboard: Open Dashboard

    Dashboard->>API: Fetch Statistics

    API->>Database: Query Data

    Database-->>API: Results

    API-->>Dashboard: Monitoring Data
```

---

# Project Structure

```text
src/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── projects/
│   │   └── ping/
│   │
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   └── projects/
│
├── components/
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── scheduler.ts
│
├── prisma/
│   └── schema.prisma
│
├── middleware.ts
│
└── types/
```


# Future Scalable Architecture

```mermaid
flowchart TB

    User[User]

    subgraph Frontend
        Dashboard[Next.js Dashboard]
    end

    subgraph APIGateway
        Gateway[API Gateway]
    end

    subgraph Services
        AuthService[Auth Service]
        ProjectService[Project Service]
        MonitoringService[Monitoring Service]
        NotificationService[Notification Service]
    end

    subgraph Messaging
        Queue[Redis / Message Queue]
    end

    subgraph Workers
        PingWorker1[Ping Worker]
        PingWorker2[Ping Worker]
        PingWorkerN[Ping Worker N]
    end

    subgraph DataLayer
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    subgraph External
        Websites[Target Websites]
        Email[Email Provider]
        Discord[Discord Webhooks]
    end

    User --> Dashboard
    Dashboard --> Gateway

    Gateway --> AuthService
    Gateway --> ProjectService
    Gateway --> MonitoringService

    AuthService --> PostgreSQL
    ProjectService --> PostgreSQL

    MonitoringService --> Queue

    Queue --> PingWorker1
    Queue --> PingWorker2
    Queue --> PingWorkerN

    PingWorker1 --> Websites
    PingWorker2 --> Websites
    PingWorkerN --> Websites

    PingWorker1 --> PostgreSQL
    PingWorker2 --> PostgreSQL
    PingWorkerN --> PostgreSQL

    MonitoringService --> NotificationService

    NotificationService --> Email
    NotificationService --> Discord

    MonitoringService --> Redis
```

---

# Roadmap

## Version 1.0

* Authentication
* Endpoint Management
* Scheduled Pings
* Monitoring Dashboard
* Ping Logs

## Version 2.0

* Redis Queue
* Background Workers
* Email Alerts
* Service Analytics
* Failure Notifications

## Version 3.0

* Multi-region Workers
* Team Workspaces
* Webhooks
* Billing System
* SLA Monitoring

---

# Goal

HotRoute aims to eliminate cold-start delays and improve application responsiveness by ensuring services remain active, monitored, and ready to handle traffic.
