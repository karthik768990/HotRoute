# HotRoute Frontend Blueprint

This document serves as the comprehensive frontend architecture and design specification for HotRoute. It prioritizes a premium, modern, and high-performance user experience akin to Vercel, Linear, and Better Stack. 

---

## 1. Information Architecture

The information architecture is designed for low cognitive load and rapid information scanning. 

### Public Pages
*   **Landing Page (`/`)**: 
    *   *Purpose*: Product marketing, value proposition, and conversion.
    *   *User Goal*: Understand what HotRoute does and sign up.
    *   *Primary Actions*: "Get Started" (CTA), read features.

### Auth Pages
*   **Login (`/login`)**: 
    *   *Purpose*: User authentication.
    *   *User Goal*: Access the dashboard securely.
    *   *Primary Actions*: Enter credentials, login with Google (future).
*   **Register (`/register`)**: 
    *   *Purpose*: Onboard new users.
    *   *User Goal*: Create an account.
    *   *Primary Actions*: Submit registration form.
*   **Forgot Password / Reset (`/forgot-password`, `/reset-password`)**: 
    *   *Purpose*: Account recovery.
    *   *User Goal*: Regain access.
    *   *Primary Actions*: Request reset link, set new password.
*   **Email Verification (`/verify-email`)**: 
    *   *Purpose*: Security and anti-spam.
    *   *User Goal*: Confirm account ownership.
    *   *Primary Actions*: Click verification link.

### Protected Pages (Dashboard)
*   **Global Dashboard (`/dashboard`)**: 
    *   *Purpose*: High-level aggregate overview of all monitored assets.
    *   *User Goal*: Quickly assess global health at a glance.
    *   *Primary Actions*: View incidents, drill down into specific projects.
*   **Projects List (`/dashboard/projects`)**: 
    *   *Purpose*: Directory of all configured monitors.
    *   *User Goal*: Find, filter, and manage existing projects or add new ones.
    *   *Primary Actions*: "Create Project", search, pause/resume monitors.
*   **Project Detail (`/dashboard/projects/[projectId]`)**: 
    *   *Purpose*: Deep dive into a specific monitor's performance.
    *   *User Goal*: Analyze downtime, response times, and recent history.
    *   *Primary Actions*: Edit project, trigger manual ping, view detailed logs.

### Settings Pages
*   **Profile Settings (`/settings/profile`)**: 
    *   *Purpose*: Manage user identity.
    *   *User Goal*: Update name, email, password.
    *   *Primary Actions*: Save changes.

---

## 2. Route Structure

The routing utilizes a clean, intuitive REST-like structure mapped to the Next.js App Router paradigm.

```text
/ (Marketing Site)

/ (Authentication)
├── /login
├── /register
├── /forgot-password
├── /reset-password
└── /verify-email

/dashboard (Protected App)
├── /                        (User Dashboard Overview)
├── /projects                (List all projects)
│   └── /[projectId]         (Project Detail)
└── /settings                (User Settings)
    └── /profile
```

*Routing Rationale*: Keeps marketing, authentication, and the core application logically separated. The `/dashboard` prefix acts as a clear boundary for authenticated states. 

---

## 3. Navigation System

**Primary Navigation: Left Sidebar**
*   *Why*: SaaS platforms with deep hierarchies and multiple tools benefit heavily from sidebars. It allows for vertical scalability as new features (e.g., cron job monitoring, SSL tracking) are added without cluttering a top navbar.
*   *Structure*:
    *   **Top**: HotRoute Logo.
    *   **Main**: Dashboard, Projects.
    *   **Bottom**: Settings, User Profile (Dropdown for logout).
*   *Behavior*: Collapsible to a slim icon-only view for power users who want maximum horizontal real estate for charts.

**Secondary Navigation: Top Navbar & Breadcrumbs**
*   *Top Navbar*: Minimal. Contains context-specific actions (e.g., "Manual Ping" button when inside a project, "Create Project" when in the project list).
*   *Breadcrumb Strategy*: Crucial for wayfinding. 
    *   Format: `Projects / [Project Name] / Settings`
    *   Enables rapid upward navigation without using the browser "back" button.

**Mobile Navigation: Bottom Tab Bar + Hamburger**
*   Core views (Dashboard, Projects) in a sticky bottom tab bar for thumb-reachability.
*   Settings and nested pages pushed to a hamburger menu.

---

## 4. User Dashboard Experience (Global Overview)

The first screen the user sees post-login. It must answer one question immediately: **"Is everything okay?"**

**Layout & Priority Order:**
1.  **Global Status Banner (Top)**: 
    *   If all is well: Subtle green banner "All systems operational."
    *   If downtime exists: High-contrast red banner "1 active incident."
2.  **Key Metrics (Grid of 4 Cards)**:
    *   `projectsUp` vs `projectsDown` (Visualized as a sleek ratio ring chart)
    *   `overallUptimePercentage` (Big typography, e.g., "99.98%")
    *   `averageResponseTime` (e.g., "124ms" with a subtle sparkline)
    *   `totalProjects` / `activeProjects` (Context metric)
3.  **Active / Recent Incidents (List View)**:
    *   If empty: Beautiful "Inbox Zero" style empty state.
    *   If populated: Urgent items showing Project Name, Duration, and Error Code.
4.  **Projects List (Table/Grid)**:
    *   Displays existing projects mapped directly from `projects` data.
    *   Provides high-level health overview for each monitored service.

**User Flow**: Login -> See Banner -> See Metrics -> Click on a down project -> Navigate to Project Detail.

---

## 5. Project Dashboard Experience (Detail View)

This is the analytical core for a specific monitor.

**Layout & Metrics:**
1.  **Header**: Project Name, URL, Status Badge (Green/Red), and a prominent "Manual Ping" button.
2.  **Summary Row**: Uptime %, Average Response Time, Last Checked.
3.  **Monitoring Health View (The "Better Stack" Bar)** [Phase 6 Enhancement]:
    *   A continuous horizontal bar based on `recentHistory`.
    *   Green for up, red for down. Hovering reveals specific timestamps and response times.
    *   *Note: This visualization should be implemented after the core dashboard, projects, and project detail experiences are functional.*
4.  **Response Time Chart (Line Chart)** [Future]:
    *   X-axis: Time. Y-axis: ms.
    *   Smooth, anti-aliased lines. Area under the curve slightly filled with a gradient.
5.  **Recent Failures Log (Table)**:
    *   Columns: Timestamp, Duration, Status Code (e.g., 502, 404), Error Message.

---

## 6. Project Management Experience

**Flow: Create Project (Drawer)**
*   *UX*: Slide-over (Drawer) from the right side triggered contextually (e.g., from Dashboard or Projects List). Keeps the user in context without navigating to `/dashboard/projects/new`.
*   *Form Layout*: Name (text), URL (text), Ping Interval (select).
*   *Validation UX*: Real-time URL validation, clear error messages below fields.
*   *Success UX*: Auto-close drawer, display success toast, optimistically add project to the list.

**Flow: Edit Project (Drawer)**
*   *UX*: Replaces `/dashboard/projects/[projectId]/settings`. Slide-over drawer triggered from the Project Detail page.
*   *Behavior*: Populates with existing project data. Updates are optimistic.
*   *Pause Flow*: Dedicated toggle switch inside the drawer (or on the detail header) to pause/resume monitoring.
*   *Delete Flow*: Destructive action at the bottom of the drawer. Requires typing the project name to confirm.

**Flow: Pause / Resume**
*   *UX*: A simple toggle switch on the Project Detail header. Instantly updates via optimistic UI, showing a "Paused" badge.

**Flow: Manual Ping**
*   *UX*: A button with a radar icon. Clicking it changes the icon to a spinner, executes the ping, and returns a toast notification ("Ping successful: 200 OK in 45ms").

**Flow: Delete**
*   *UX*: Hidden in a "Danger Zone" within project settings. Requires typing the project name to confirm (prevents accidental deletion of critical history).

---

## 6.1. First-Time User Experience (Onboarding)

**Flow: First Project Experience**
1.  **Register**: User creates an account.
2.  **Verify Email**: User clicks the link in their email.
3.  **Dashboard**: User lands on the User Dashboard.
4.  **Empty State**: Dashboard shows "Welcome to HotRoute" empty state.
5.  **Create First Monitor**: Prominent CTA opens the Create Project Drawer.
6.  **Monitoring Starts Automatically**: Upon creation, the backend immediately triggers the first ping.
7.  **Success State**: Dashboard populates with the first project's health data and a success toast.

---

## 6.2. Empty States

*   **User Dashboard**:
    *   *Headline*: Welcome to HotRoute
    *   *Description*: Start monitoring your services in seconds.
    *   *Primary CTA*: Create Monitor
    *   *Secondary CTA*: Read Documentation
*   **Projects Page**:
    *   *Headline*: No Projects Yet
    *   *Description*: You haven't set up any monitors. Add your first URL to track uptime.
    *   *Primary CTA*: Create Project
*   **Recent Incidents**:
    *   *Headline*: All Clear
    *   *Description*: No incidents reported. Your services are running smoothly.
*   **Project Dashboard** (e.g., no history yet):
    *   *Headline*: Waiting for Data
    *   *Description*: Monitoring has started. Data will appear here shortly.

---

## 6.3. Projects Table Specification

**Columns (Recommended Order):**
1.  **Status**: Green/Red indicator dot.
2.  **Project Name**: Bold text.
3.  **URL**: Muted text, truncate if long.
4.  **Interval**: e.g., "1m", "5m".
5.  **Uptime %**: e.g., "99.9%".
6.  **Average Response Time**: e.g., "120ms".
7.  **Last Ping**: e.g., "2m ago".
8.  **Actions**: Meatballs menu (Edit, Pause, Delete).

**Desktop Behavior**: Full table view with sortable headers.
**Mobile Behavior**: Stacked cards. Status, Name, and Actions on top row. URL and metrics below.

---

## 7. Visual Identity & Design System

A premium, modern SaaS look (Vercel/Linear aesthetic).

*   **Color System**:
    *   *Background (Dark Mode)*: True black `#000000` or very deep gray `#0A0A0A`.
    *   *Background (Light Mode)*: Pure white `#FFFFFF` or off-white `#FAFAFA`.
    *   *Surface*: Slightly elevated panels using `rgba(255,255,255,0.05)` with `backdrop-filter: blur()`.
    *   *Primary Brand*: An electric, vivid accent color (e.g., Cobalt Blue `#0070F3` or Neon Purple `#7928CA`).
    *   *Semantic*: Success (Emerald Green `#10B981`), Danger (Rose Red `#F43F5E`), Warning (Amber `#F59E0B`).
*   **Typography**:
    *   *Primary Font*: `Inter` or `Geist`. Clean, geometric sans-serif.
    *   *Numbers/Code*: `JetBrains Mono` or `Geist Mono` for precise alignment of metrics and logs.
*   **Spacing**: Strict 4px/8px baseline grid. High padding inside cards to let content breathe.
*   **Border Radius**: Small and sharp (`6px` or `8px`), avoiding overly bubbly designs.
*   **Borders**: Extremely subtle 1px borders (`rgba(255,255,255,0.1)`) to delineate edges in dark mode.
*   **Shadows**: Soft, diffuse shadows in light mode; harsh, glow-like shadows for active states in dark mode.
*   **Animations**: Minimal. Fast transitions (`150ms ease-in-out`) for hovers. Micro-interactions on buttons.

---

## 8. Component Inventory

*   **Cards**: Metric Card, Incident Card, Project Overview Card.
*   **Data Displays**: Uptime Bar (90-day segments), Response Time Area Chart, Ping History Timeline.
*   **Tables**: Incident Log Table (sortable, paginated).
*   **Forms**: Slide-over Drawer Form, Inline edit fields.
*   **Feedback/Modals**: Toast Notifications (success/error), Confirmation Dialogs (Destructive actions).
*   **Navigation**: Sidebar Links (with active state), Breadcrumbs, User Dropdown.
*   **Empty States**: "No incidents reported", "Create your first project" (with illustrative, high-quality SVG icons).
*   **States**: Skeleton loaders mimicking the shape of the data for fast perceived load times.

---

## 9. Frontend Architecture (Next.js App Router)

*   **Framework**: Next.js (App Router).
*   **Data Fetching**: React Server Components (RSC) for initial dashboard load; Client Components only where interactivity is needed (charts, forms).
*   **Folder Structure**:
    ```text
    src/
    ├── app/                    (App Router - Routes)
    │   ├── (auth)/             (Route Group for login/register)
    │   ├── dashboard/          (Protected routes)
    │   └── layout.tsx
    ├── components/
    │   ├── ui/                 (Dumb, reusable components - shadcn/ui)
    │   ├── auth/               (Login forms, registration)
    │   ├── dashboard/          (Global dashboard widgets)
    │   ├── project/            (Project-specific views and charts)
    │   └── layout/             (Sidebar, Topbar, Shells)
    ├── lib/
    │   ├── api.ts              (Typed fetch client connecting to existing backend)
    │   ├── utils.ts            (Classname mergers, formatting dates)
    │   └── hooks/              (Custom React hooks)
    ├── types/                  (TypeScript interfaces matching backend DTOs)
    └── store/                  (Client-side state, if needed)
    ```
*   **State Management**: 
    *   Server State: Rely heavily on React Server Components and Server Actions. For client-side mutations, use `SWR` or `React Query` to handle caching, optimistic updates, and revalidation against the existing backend.
    *   UI State: React `useState` and Context API (e.g., for Sidebar collapse state). No Redux required.
*   **Styling Strategy**: Tailwind CSS (with a custom configuration enforcing the design tokens mentioned in Phase 7) combined with CSS Modules for highly complex bespoke animations if necessary. *(Note: Tailwind is mentioned here purely architecturally for the stack, as per modern SaaS standards, but no code will be generated).*
*   **Component Strategy Note**: Replacing `domain/` with feature-specific folders (`auth/`, `dashboard/`, `project/`) is recommended. This scales better as features grow, keeping related domain components naturally grouped rather than dumping all smart components into a single `domain/` bucket.

---

## 10. UX Decisions & Future Scalability Notes

*   **Optimistic UI**: When a user clicks "Pause Monitoring", the UI should instantly reflect the paused state before the backend confirms, ensuring the app feels lightning fast.
*   **Timezone Handling**: All dates and times must be localized to the user's browser timezone automatically, with a global override setting in `/settings`.
*   **Data Polling vs. WebSockets**: Given the backend has a worker pool and scheduler, the frontend dashboard should initially rely on SWR/React Query polling (e.g., every 10-30 seconds) to refresh the "Recent Incidents" and "Uptime" metrics. In the future, this can scale to WebSockets for true real-time incident pushing.
*   **Accessibility (a11y)**: The dark-mode first design must maintain WCAG AA contrast ratios, particularly on the red/green status indicators (considering red/green color blindness, icons like a 'Check' or 'X' must accompany the colors).

---

## 11. Future Roadmap (Post-MVP)

The following features have been explicitly excluded from the MVP scope to ensure rapid delivery of the core single-user monitoring experience:

*   **Dedicated Incidents Page**: Advanced historical incident search and filtering (`/dashboard/incidents`).
*   **Pricing & Billing**: Subscription flows, Stripe integration.
*   **Team Management**: Multi-user workspaces, RBAC, invites.
*   **Public Status Pages**: Customer-facing uptime pages (`/status/[companyId]`).
*   **Organization Management**: Handling multiple tenants or orgs.

---

## 12. Frontend Implementation Roadmap

### Phase 1: Foundation
*   **Dependencies**: Next.js App Router, Tailwind CSS, shadcn/ui, TanStack Query.
*   **Setup**: Base folder structure, global CSS, theme provider (Dark/Light mode), Toast system (Sonner or native shadcn toast), API Client setup (Axios/Fetch wrapper).

### Phase 2: Authentication
*   **Pages**: `/login`, `/register`, `/forgot-password`, `/verify-email`.
*   **Components**: Auth Provider, Protected Layout wrapper, Auth Forms.
*   **APIs**: Integration with existing Auth endpoints.

### Phase 3: Layout
*   **Components**: Sidebar, Topbar, Breadcrumbs, Main Shell.
*   **Interactions**: Responsive collapse/expand for Sidebar.

### Phase 4: User Dashboard
*   **Pages**: `/dashboard`.
*   **Components**: Dashboard Shell, Summary Metric Cards, Recent Incidents List.
*   **Empty States**: "Welcome to HotRoute" onboarding flow.
*   **APIs**: Dashboard summary endpoint.

### Phase 5: Projects
*   **Pages**: `/dashboard/projects`.
*   **Components**: Projects Table (responsive), Create Project Drawer.
*   **Empty States**: "No Projects Yet".
*   **APIs**: Projects CRUD endpoints.

### Phase 6: Project Dashboard
*   **Pages**: `/dashboard/projects/[projectId]`.
*   **Components**: Project Header, Monitoring Health View (Better Stack Bar), Recent Failures Log, Edit Project Drawer.
*   **APIs**: Project detail, recent history, failure logs, pause/resume/ping actions.

### Phase 7: Polish
*   **Tasks**: Optimistic UI refinement across mutations, loading skeletons, error states, accessibility audits, and final UI adjustments.
