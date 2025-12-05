# Project Titan: Enterprise HRMS Product Roadmap

This document contains a highly granular, prompt-driven roadmap to build "Project Titan" - a commercial-grade, multi-tenant SaaS HRMS.

**Core Philosophy:**
- **Granularity:** Prompts are broken down into small, atomic units to prevent token limits and compilation errors.
- **Documentation First:** Every prompt updates the central documentation (Architecture, Schema, API).
- **Automation:** Automated testing (Playwright) is integrated from Day 1.
- **Product Quality:** "Bank-grade" security, "Consumer-grade" UX (AntD + Tailwind + Framer Motion), and "Enterprise-grade" stability.

**Tech Stack:**
- **Backend:** Spring Boot 3.2+ (Java 21), PostgreSQL, Redis, Spring Security (Oauth2/JWT).
- **Frontend:** React 18, TypeScript, Vite, Ant Design 5.0, Tailwind CSS, Framer Motion.
- **Testing:** Playwright (E2E), JUnit 5 (Backend).
- **Infrastructure:** Docker Compose (Dev), Kubernetes (Prod).

---

## Phase 1: The Foundation (SaaS Core)

### Prompt 1.1: Monorepo & Docker Setup
> "Initialize the 'Titan' Monorepo structure.
>
> 1. **Directory Structure:**
>    - `/backend` (Spring Boot)
>    - `/frontend` (React + Vite)
>    - `/automation` (Playwright)
>    - `/docs` (Architecture, Schema)
>    - `/infrastructure` (Docker, K8s)
> 2. **Docker Compose:** Create a `docker-compose.yml` in root that spins up:
>    - `postgres` (Port 5432)
>    - `redis` (Port 6379)
>    - `mailhog` (Port 1025/8025 for local SMTP testing)
> 3. **Environment:** Create a root `.env` file (and `.env.example`) for DB credentials, JWT secrets, and SMTP details.
> 4. **Git:** Initialize git and create a `.gitignore` covering all 3 projects.
> 5. **Validation:** Ensure `docker-compose up` works and services are reachable."

### Prompt 1.2: Backend Skeleton & Multi-Tenancy
> "Initialize the Spring Boot Backend.
>
> 1. **Setup:** Spring Boot 3, Java 21. Deps: Web, JPA, Security, Validation, PostgreSQL, Lombok, Redis, Flyway.
> 2. **Multi-Tenancy:** Implement `TenantContext` (ThreadLocal) and a `TenantFilter` to extract `X-Tenant-ID` header.
> 3. **Base Entity:** Create `BaseEntity` (id, tenantId, createdAt, updatedAt) that all entities will extend.
> 4. **Config:** Configure `application.yml` to read from `.env`.
> 5. **Docs:** Create `/docs/backend_architecture.md` explaining the multi-tenancy strategy."

### Prompt 1.3: Database Schema Management
> "Set up the centralized Schema documentation.
>
> 1. **Schema File:** Create `/docs/schema.sql`. This file will be the 'Source of Truth' for the DB schema.
> 2. **Initial Schema:** Add SQL for `organizations` and `users` tables to `schema.sql`.
> 3. **Flyway:** Create the first Flyway migration `V1__init_schema.sql` matching the content in `schema.sql`.
> 4. **Entity:** Create `Organization` entity (id, name, domain, subscription_plan).
> 5. **Repository:** Create `OrganizationRepository`.
> 6. **Test:** Write a JUnit test to verify `Organization` persistence."

---

## Phase 2: Security & Identity

### Prompt 2.1: Authentication Core (JWT)
> "Implement the Security Core.
>
> 1. **User Entity:** Create `User` entity (email, password_hash, role_id). Update `schema.sql`.
> 2. **JWT:** Implement `JwtTokenProvider` (Generate, Validate, Get Claims). Use `RS256` signing if possible, or `HS256` with a strong secret from `.env`.
> 3. **Filters:** Implement `JwtAuthenticationFilter`.
> 4. **Config:** Configure `SecurityFilterChain` to allow `/auth/**` and lock down `/api/**`.
> 5. **Test:** Write a JUnit test for Token Generation and Validation."

### Prompt 2.2: RBAC (Role-Based Access Control)
> "Implement Dynamic RBAC.
>
> 1. **Schema:** Add `roles` and `permissions` tables to `schema.sql` and Flyway.
>    - `Role` (id, name, tenant_id)
>    - `Permission` (id, name, description) - System level, not tenant specific.
>    - `role_permissions` (mapping table).
> 2. **Seeding:** Create a `DataSeeder` to populate default permissions (e.g., `employee:read`, `payroll:run`) and default roles (`SuperAdmin`, `OrgAdmin`, `Employee`).
> 3. **Method Security:** Enable `@EnableMethodSecurity`.
> 4. **Docs:** Update `/docs/backend_architecture.md` with the RBAC model."

### Prompt 2.3: Auth Endpoints & SMTP
> "Build the Auth API.
>
> 1. **Endpoints:** `POST /auth/login`, `POST /auth/refresh-token`, `POST /auth/forgot-password`.
> 2. **Service:** Implement `AuthService`.
>    - `login`: Validate creds, return Access Token (JSON) + Refresh Token (HttpOnly Cookie).
>    - `forgot-password`: Generate token, send email using `JavaMailSender` (use SMTP details from `.env`).
> 3. **Test:** Verify Login returns correct tokens."

---

## Phase 3: Frontend Foundation (Enterprise UI)

### Prompt 3.1: Vite & Ant Design Setup
> "Initialize the React Frontend.
>
> 1. **Setup:** Vite + React + TypeScript.
> 2. **UI Library:** Install `antd`. Configure `ConfigProvider` for a corporate theme (Primary Color: `#0f172a` - Slate 900).
> 3. **Styling:** Install `tailwindcss` and configure it to work with AntD (disable preflight if needed or use `antd-style`).
> 4. **State:** Install `zustand` for state management (simpler than Redux).
> 5. **Docs:** Create `/docs/frontend_architecture.md`."

### Prompt 3.2: Layout & Navigation
> "Build the Application Shell.
>
> 1. **Layout:** Create `DashboardLayout` using AntD `Layout`.
>    - **Sidebar:** Collapsible, driven by a config array.
>    - **Header:** User Avatar, Tenant Switcher, Notification Bell.
> 2. **Animations:** Use `framer-motion` for smooth page transitions and sidebar toggle.
> 3. **Router:** Setup `react-router-dom` with `ProtectedRoute` wrapper (checks Auth Store).
> 4. **Test:** Verify the Layout renders and Sidebar toggles."

### Prompt 3.3: Playwright Automation Setup
> "Initialize the Automation Framework.
>
> 1. **Setup:** Initialize Playwright in `/automation`.
> 2. **Config:** Configure `playwright.config.ts` to read `BASE_URL` from `.env`.
> 3. **Helpers:** Create `LoginPage` object model.
> 4. **Test:** Write `login.spec.ts` that:
>    - Navigates to Login page.
>    - Enters valid creds.
>    - Asserts redirection to Dashboard.
> 5. **CI:** Add a script in root `package.json` to run these tests."

---

## Phase 4: Core HR (Employee Management)

### Prompt 4.1: Employee Schema & API
> "Build the Employee Backend.
>
> 1. **Schema:** Add `employees` table to `schema.sql`.
>    - Columns: `user_id`, `first_name`, `last_name`, `emp_code`, `joining_date`, `department_id`, `designation_id`.
> 2. **Entities:** Create `Employee`, `Department`, `Designation`.
> 3. **API:** `POST /api/employees` (Onboard), `GET /api/employees` (List), `GET /api/employees/{id}`.
> 4. **Validation:** Ensure `emp_code` is unique per tenant.
> 5. **Docs:** Update `/docs/schema.sql`."

### Prompt 4.2: Employee Directory UI
> "Build the Employee Directory.
>
> 1. **Table:** Use AntD `ProTable` (if available) or `Table`.
>    - Columns: Avatar + Name, ID, Dept, Status (Badge).
>    - Actions: View, Edit.
> 2. **Filters:** Add filters for Department and Status.
> 3. **Animations:** Add row entrance animations.
> 4. **Integration:** Fetch data from `/api/employees` using `react-query`."

### Prompt 4.3: Document Management (Blob)
> "Implement Document Management.
>
> 1. **Schema:** Add `documents` table (id, entity_id, entity_type, file_url, file_type).
> 2. **Storage:** Implement `StorageService`. Use `MinIO` (S3 compatible) in Docker or Azure Blob (use credentials from `.env`).
> 3. **API:** `POST /api/documents/upload`, `GET /api/documents/{id}/download`.
> 4. **Permissions:** Ensure only `employee:read_docs` can view and `employee:write_docs` can upload.
> 5. **UI:** Add a 'Documents' tab in Employee Profile to upload/view files."

---

## Phase 5: Advanced Modules

### Prompt 5.1: Universal Approval Engine
> "Build the Workflow Engine Backend.
>
> 1. **Schema:** Add `approval_requests` and `approval_logs` tables.
> 2. **Logic:** Create a generic service that accepts an `entityId` and `type` (LEAVE, EXPENSE) and routes it to the correct approver (Manager/HR).
> 3. **API:** `POST /api/approvals/{id}/approve`, `POST /api/approvals/{id}/reject`.
> 4. **Docs:** Update `/docs/backend_architecture.md` with the workflow state machine."

### Prompt 5.2: Leave Management
> "Implement Leave Module.
>
> 1. **Schema:** `leave_types`, `leave_balances`, `leave_applications`.
> 2. **API:** `POST /api/leaves/apply`. Triggers the Approval Engine.
> 3. **UI:** 'My Leaves' dashboard showing balances (Cards) and History (Table).
> 4. **Automation:** Write a Playwright test: Employee applies for leave -> Manager approves."

### Prompt 5.3: Attendance (Geo-fencing)
> "Implement Attendance Module.
>
> 1. **Schema:** `attendance_logs` (employee_id, check_in, check_out, lat, long, ip_address).
> 2. **API:** `POST /api/attendance/check-in`. Validate Lat/Long against Office Location (if configured).
> 3. **UI:** A 'Clock In' widget on the Dashboard. Show a Map preview of the location."

---

## Phase 6: Delivery & Polish

### Prompt 6.1: Analytics & Reports
> "Build the Reporting Module.
>
> 1. **Backend:** Create a `ReportService` that executes dynamic SQL queries safely.
> 2. **UI:** A 'Reports' page where admins can select columns and filters to generate a CSV/Excel.
> 3. **Dashboard:** Add charts (Ant Design Charts) for 'Headcount', 'Attrition', 'Leave Trends'."

### Prompt 6.2: Final Polish & CI/CD
> "Finalize the Product.
>
> 1. **CI/CD:** Create `.github/workflows/main.yml` to run JUnit and Playwright tests on push.
> 2. **Seed Data:** Ensure `DataSeeder` populates a full demo environment.
> 3. **Readme:** Update `README.md` with setup instructions for new developers.
> 4. **Cleanup:** Remove any unused endpoints or files."
