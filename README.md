# HRMS Portal - Enterprise Human Resource Management System

A comprehensive, enterprise-grade HRMS built with Spring Boot backend and React frontend, featuring multi-tenancy, RBAC, and complete employee lifecycle management.

## Table of Contents

- [Quick Start](#quick-start)
- [Features Overview](#features-overview)
- [Tech Stack](#tech-stack)
- [Setup & Deployment](#setup--deployment)
- [Demo Data Management](#demo-data-management)
- [Module Documentation](#module-documentation)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

**Local Development:**
- Java 21 (JDK)
- Maven 3.9+
- Node.js 18+

**Docker Deployment:**
- Docker Engine 20.10+
- Docker Compose 2.0+

### 1. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

**Required Configuration:**
- Database connection (SQL Server)
- JWT secret: `openssl rand -base64 32`
- Super admin credentials
- Azure Storage connection string

### 2. Choose Your Setup

#### Option A: Local Development

```bash
# Start Backend
cd backend
mvn spring-boot:run
# → http://localhost:8080

# Start Frontend (in new terminal)
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

#### Option B: Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Access Application

- **Local**: http://localhost:3000
- **Docker**: http://your-vm-ip
- **Login**: Use credentials from `.env` (SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD)

---

## Features Overview

### 🎯 Core Modules (9 Complete)

| Module | Description | Key Features |
|--------|-------------|--------------|
| **Attendance** | Daily tracking & regularization | Check-in/out, GPS tracking, shift management, regularization requests |
| **Leave** | Leave management & balances | Applications, approvals, balance tracking, multiple leave types |
| **Timesheet** | Project time tracking | Weekly timesheets, project/task logging, manager approvals |
| **Payroll** | Salary processing | Monthly runs, payslip generation, component management |
| **Performance** | Reviews & goal tracking | 360° reviews, SMART goals, review cycles, ratings |
| **Recruitment** | Hiring pipeline | Job postings, applications, interview scheduling |
| **Assets** | IT asset management | Asset tracking, assignments, QR codes, maintenance |
| **Expenses** | Expense reimbursement | Claims, receipts, category management, approvals |
| **Projects** | Project management | Projects, tasks, Kanban boards, team allocation |

### ✨ Platform Features

- **Multi-Tenancy**: Organization-level data isolation
- **RBAC**: Flexible role-based access control with custom permissions
- **JWT Authentication**: Secure token-based authentication
- **File Management**: Azure Blob Storage integration
- **Premium UI**: Modern, responsive design with Ant Design
- **Analytics**: Rich dashboards and reports
- **Audit Logs**: Complete audit trail
- **Document Management**: Upload, organize, and request documents

### 📊 Statistics

- **73 UI Pages**: Comprehensive coverage of all workflows
- **103 Database Tables**: Complete data model
- **200+ API Endpoints**: Full CRUD operations
- **9 Core Modules**: Feature-complete implementations

---

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 21
- **Database**: SQL Server
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **Storage**: Azure Blob Storage
- **Build**: Maven

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript 5.2.2
- **UI Library**: Ant Design 5.12.0
- **Charts**: Recharts
- **Routing**: React Router v6
- **Build**: Vite
- **HTTP Client**: Axios

---

## Setup & Deployment

### Environment Configuration

#### Database Connection
```env
SPRING_DATASOURCE_URL=jdbc:sqlserver://host:1433;databaseName=hrms_db
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
```

#### Security
```env
SECURITY_JWT_SECRET=<generate with: openssl rand -base64 32>
SECURITY_JWT_EXPIRATION=86400000
```

#### Super Admin
```env
SUPERADMIN_EMAIL=admin@yourcompany.com
SUPERADMIN_PASSWORD=YourStrongPassword123!
```

#### Azure Storage
```env
STORAGE_AZURE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
STORAGE_AZURE_CONTAINER=hrms-documents
```

#### CORS (Adjust for your environment)
```env
# Local Development
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost

# Production
CORS_ALLOWED_ORIGINS=https://yourdomain.com,http://your-vm-ip
```

### Local Development

**Backend:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Verify:**
```bash
# Backend health
curl http://localhost:8080/actuator/health

# Frontend (open in browser)
http://localhost:3000
```

### Docker Deployment

**Build & Deploy:**
```bash
# Build and start
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Docker Commands:**
```bash
# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build

# Clean up everything
docker-compose down -v
```

### Production Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Use strong admin password
- [ ] Restrict CORS to your domain only
- [ ] Set `SWAGGER_ENABLED=false`
- [ ] Configure HTTPS (reverse proxy/load balancer)
- [ ] Never commit `.env` to git
- [ ] Set file permissions: `chmod 600 .env`
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure monitoring and logging

---

## Demo Data Management

### Loading Demo Data

Run the application with the `demo` profile to automatically load test data:

```bash
# Local Development
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=demo

# Docker
# Add to docker-compose.yml:
# environment:
#   - SPRING_PROFILES_ACTIVE=demo
```

**Demo Data Includes:**
- 10 Organizations (Demo Tech Solutions Inc, Demo Healthcare Systems, etc.)
- 12 Employees (varied types: internal, contractual, vendor, client, sub-vendor)
- 3 Clients
- 2 Vendors
- 3 Projects
- 5 Departments (IT, HR, Finance, Sales, Operations)
- 6 Positions (Manager, Senior, Mid, Junior levels)

**Demo Login Credentials:**
- **OrgAdmin**: admin@demo-tech.com / Demo@123456
- **Employee**: bob.builder@demo-tech.com / Demo@123456

### Cleaning Up Demo Data

Two methods to clean demo data:

#### Method 1: API Endpoint (Requires SYSADMIN role)

```bash
# Get count of demo data
curl -X GET http://localhost:8080/api/demo/count \
  -H "Authorization: Bearer <your-jwt-token>"

# Delete all demo data
curl -X DELETE http://localhost:8080/api/demo/cleanup \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Demo data cleaned up successfully",
  "organizationsDeleted": 10,
  "totalRecordsDeleted": 150
}
```

#### Method 2: Direct Database Cleanup

```sql
-- Delete all organizations with names starting with "Demo "
-- (This will cascade delete all related data)
DELETE FROM organizations WHERE name LIKE 'Demo %';
```

**Note:** The cleanup endpoint is only available when the `demo` profile is active for security.

---

## Module Documentation

### 1. Attendance Module

**Features:**
- Daily check-in/check-out tracking
- Work hours calculation
- Shift management (multiple shifts)
- Regularization requests (late arrival, early departure, WFH)
- Location tracking (GPS/IP-based)
- Monthly reports with export

**API Endpoints:**
```
GET    /api/attendance/records
POST   /api/attendance/records
PUT    /api/attendance/records/{id}
DELETE /api/attendance/records/{id}

GET    /api/attendance/shifts
POST   /api/attendance/shifts
```

### 2. Leave Management Module

**Features:**
- Leave applications with approval workflow
- Multiple leave types (Annual, Sick, Casual, Maternity, Paternity, etc.)
- Real-time balance tracking
- Carry forward rules
- Pro-rata calculations
- Leave history and calendar view

**API Endpoints:**
```
GET    /api/leave/applications
POST   /api/leave/applications
PUT    /api/leave/applications/{id}

GET    /api/leave/balances?employeeId={id}
GET    /api/leave/types
```

### 3. Timesheet Module

**Features:**
- Weekly timesheet grid
- Project and task selection
- Billable/non-billable tracking
- Manager approval workflow
- Copy previous week
- Hours breakdown by project

**API Endpoints:**
```
GET    /api/timesheet/entries?employeeId={id}&week={date}
POST   /api/timesheet/entries
PUT    /api/timesheet/entries/{id}

GET    /api/timesheet/approvals
POST   /api/timesheet/approvals/{id}/approve
```

### 4. Payroll Module

**Features:**
- Monthly/bi-weekly payroll processing
- Payslip generation (PDF)
- Salary component management
- Tax calculations (TDS)
- Earnings and deductions
- Email distribution

**Salary Components:**
- Basic, HRA, Conveyance, Medical Allowance
- Performance Bonus
- Provident Fund (PF), Professional Tax (PT)
- Income Tax (TDS)

**API Endpoints:**
```
GET    /api/payroll/runs
POST   /api/payroll/runs
GET    /api/payroll/payslips?employeeId={id}
GET    /api/payroll/payslips/{id}/download
```

### 5. Performance Module

**Features:**
- 360-degree feedback
- Self-assessment and manager reviews
- SMART goal setting
- Progress tracking (Kanban board)
- Rating system (1-5 stars)
- Review cycles management

**API Endpoints:**
```
GET    /api/performance/reviews
POST   /api/performance/reviews
GET    /api/performance/goals?employeeId={id}
POST   /api/performance/goals
```

### 6. Recruitment Module

**Features:**
- Job postings with rich text editor
- Application tracking
- Interview scheduling (Calendar view)
- Multiple interview types (Phone, Video, In-person, Technical, HR)
- Candidate rating
- Application status pipeline

**API Endpoints:**
```
GET    /api/recruitment/jobs
POST   /api/recruitment/jobs
GET    /api/recruitment/applications
POST   /api/recruitment/interviews
```

### 7. Asset Management Module

**Features:**
- Asset registration with QR codes
- Asset categories and depreciation
- Assignment tracking
- Maintenance records
- Location tracking
- Condition assessment

**Common Asset Types:**
- Laptops, Desktop Computers, Monitors
- Mobile Phones, Tablets
- Printers, Furniture, Vehicles

**API Endpoints:**
```
GET    /api/assets/assets
POST   /api/assets/assets
GET    /api/assets/assignments
POST   /api/assets/assignments
```

### 8. Expense Management Module

**Features:**
- Multi-item expense claims
- Receipt upload (images, PDF)
- Category-wise limits
- Approval workflow
- Reimbursement tracking

**Common Categories:**
- Travel, Accommodation, Meals
- Transportation, Fuel
- Communication, Office Supplies
- Professional Development

**API Endpoints:**
```
GET    /api/expenses/claims
POST   /api/expenses/claims
GET    /api/expenses/categories
```

### 9. Project Management Module

**Features:**
- Project creation with budget allocation
- Client and manager assignment
- Task management (Kanban board)
- Team member management
- Progress tracking
- Billable/non-billable toggle

**API Endpoints:**
```
GET    /api/projects/projects
POST   /api/projects/projects
GET    /api/projects/tasks
POST   /api/projects/tasks
```

---

## API Documentation

### Authentication

**Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response:
{
  "token": "jwt_token_here",
  "user": {...},
  "roles": ["orgadmin"]
}
```

**Set Password:**
```bash
POST /api/auth/set-password
{
  "token": "reset_token",
  "password": "newpassword123"
}
```

### Standard CRUD Pattern

All modules follow RESTful conventions:

```
GET    /api/{module}/{entity}              # List all
GET    /api/{module}/{entity}/{id}         # Get by ID
POST   /api/{module}/{entity}              # Create new
PUT    /api/{module}/{entity}/{id}         # Update
DELETE /api/{module}/{entity}/{id}         # Delete
```

### Query Parameters

- `?page=0&size=20` - Pagination
- `?sort=createdAt,desc` - Sorting
- `?search=keyword` - Search
- `?status=ACTIVE` - Filtering

### Authentication

All API requests (except login) require JWT token:

```bash
curl -X GET http://localhost:8080/api/employees \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check .env file exists
ls -la .env

# Verify Java version
java -version  # Should be 21

# Check database connectivity
telnet your-db-host 1433

# Check if port 8080 is in use
lsof -i :8080
```

### Frontend Won't Start

```bash
# Check Node version
node -v  # Should be 18+

# Clear and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check port 3000
lsof -i :3000
```

### Docker Issues

```bash
# Check Docker status
sudo systemctl status docker

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Verify .env is loaded
docker-compose config

# Check environment variables
docker-compose exec backend env | grep SPRING
```

### Common Errors

**"Failed to determine a suitable driver class"**
→ Missing or incorrect `SPRING_DATASOURCE_URL` in `.env`

**"Access Denied for user"**
→ Incorrect database credentials in `.env`

**"CORS policy: No 'Access-Control-Allow-Origin'"**
→ Add frontend URL to `CORS_ALLOWED_ORIGINS` in `.env`

**"JWT secret cannot be null"**
→ Missing `SECURITY_JWT_SECRET` in `.env`
→ Generate: `openssl rand -base64 32`

### Database Issues

```bash
# Test connection
telnet db-host 1433

# Check firewall
# Ensure DB allows connections from your IP

# For Azure SQL
# Add your IP to firewall rules in Azure Portal
```

---

## Database Schema

The system uses 103 tables organized into modules:

**Core Tables:**
- Authentication: users, roles, permissions, role_permissions
- Organization: organizations, departments, positions, employees
- Attendance: attendance_records, shifts, regularization_requests
- Leave: leave_types, leave_applications, leave_balances
- Timesheet: timesheet_entries, timesheet_summary
- Payroll: payroll_runs, payslips, salary_components
- Performance: performance_reviews, employee_goals, cycles
- Recruitment: job_postings, applications, interview_schedules
- Assets: assets, asset_categories, asset_assignments
- Expenses: expense_claims, expense_categories
- Projects: projects, project_tasks
- Documents: documents, document_requests
- Vendors: vendors
- Clients: clients
- Audit: audit_logs

---

## Access Control

### User Roles

**SuperAdmin**
- System-wide access
- Organization management
- All administrative functions

**OrgAdmin (Organization Administrator)**
- Full access within organization
- Employee management
- All modules access
- Reports and analytics

**Employee**
- Personal information access
- Leave applications
- Timesheet entries
- Expense claims
- Limited read access

### Permission System

**Resource-Based Permissions:**
- Resource: employees, departments, leave, payroll, etc.
- Action: read, create, update, delete, approve
- Scope: own, department, organization, all

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://your-vm-ip/actuator/health

# Backend metrics
curl http://your-vm-ip/actuator/metrics
```

### Logs

```bash
# Local
# Check console output

# Docker
docker-compose logs --tail=100 backend
docker-compose logs -f frontend

# Export logs
docker-compose logs > app-logs.txt
```

### Updates

**Local:**
```bash
git pull origin main
cd backend && mvn clean install && mvn spring-boot:run
cd frontend && npm install && npm run dev
```

**Docker:**
```bash
git pull origin main
docker-compose up -d --build
```

---

## Support & Resources

- **Backend Logs**: Console output or `docker-compose logs backend`
- **Frontend Logs**: Browser console or `docker-compose logs frontend`
- **Database**: Check Azure SQL Database portal
- **Documentation**: This README covers all features

---

## License

Proprietary

---

**Last Updated**: November 2025
**Version**: 2.0.0
