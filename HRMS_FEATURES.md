# HRMS Platform - Complete Feature Documentation

## Overview

This is a comprehensive, enterprise-grade Human Resource Management System (HRMS) built with Spring Boot backend and React frontend. The platform provides complete employee lifecycle management with role-based access control, multi-tenancy support, and rich analytics.

## Architecture

### Technology Stack

**Backend:**
- Spring Boot 3.2.0
- Java 17
- Spring Data JPA / Hibernate
- SQL Server Database
- JWT Authentication
- RESTful API Architecture

**Frontend:**
- React 18.2.0
- TypeScript 5.2.2
- Ant Design 5.12.0
- Vite Build Tool
- Recharts for Data Visualization
- React Router v6

### System Architecture

- **Multi-Tenancy**: Organization-level data isolation
- **Role-Based Access Control (RBAC)**: Flexible permission system
- **RESTful APIs**: Standard HTTP methods with JSON payloads
- **JWT Authentication**: Secure token-based auth
- **Layered Architecture**: Controller → Service → Repository → Entity

---

## Core Modules

###1. **Organization & Employee Management**

#### Organization Structure
- Organizations (Multi-tenant entities)
- Departments (hierarchical structure)
- Positions (job roles and levels)
- Employee Directory
- Organization Chart (tree view)
- Employee Hierarchy

#### Employee Lifecycle
- Employee Onboarding
- Personal Information Management
- Employment History Tracking
- Document Management
- Employee Code Generation
- Bulk Import via CSV/Excel

#### Fields & Attributes:
- Personal: Name, Email, Phone, Date of Birth, Gender, Address
- Employment: Employee Code, Join Date, Department, Position, Manager
- Compensation: Salary, Currency, Payment Method
- Status: Active, Inactive, Terminated

---

### 2. **Attendance Module**

**Color Theme**: #1890ff (Blue)
**Icon**: ClockCircleOutlined
**Routes**: `/admin/attendance/*`

#### Features:

**Attendance Records**
- Daily check-in/check-out tracking
- Work hours calculation
- Location tracking (GPS/IP-based)
- Device integration (biometric devices)
- Attendance status (Present, Absent, Late, Half Day)
- Monthly attendance reports
- Export functionality

**Regularization Requests**
- Missing check-in/out requests
- Late arrival justification
- Early departure requests
- Work from home requests
- Supporting document upload
- Multi-level approval workflow

**Shift Management**
- Multiple shift definitions
- Flexible shift timings
- Break duration configuration
- Grace period settings
- Overnight shift support
- Shift assignment to employees

**UI Layouts**:
- Records: Professional table with filters
- Regularization: Card-based layout with status indicators
- Shifts: Table with inline toggle switches

**API Endpoints**:
```
GET    /api/attendance/records
POST   /api/attendance/records
PUT    /api/attendance/records/{id}
DELETE /api/attendance/records/{id}

GET    /api/attendance/regularization
POST   /api/attendance/regularization
PUT    /api/attendance/regularization/{id}

GET    /api/attendance/shifts
POST   /api/attendance/shifts
PUT    /api/attendance/shifts/{id}
```

---

### 3. **Leave Management Module**

**Color Theme**: #52c41a (Green)
**Icon**: CalendarOutlined
**Routes**: `/admin/leave/*`

#### Features:

**Leave Applications**
- Apply for leaves
- Leave type selection
- Date range selection
- Days auto-calculation
- Reason and attachments
- Real-time balance check
- Multi-level approval workflow
- Leave cancellation
- Leave history

**Leave Balances**
- Per-employee leave balances
- Leave type wise breakdown
- Carried forward leaves
- Pending/approved/rejected counts
- Visual progress indicators
- Low balance alerts

**Leave Types Management**
- Create custom leave types
- Configure max days
- Carry forward settings
- Accrual rules
- Pro-rata calculation
- Gender-specific leaves (Maternity, Paternity)

**Common Leave Types**:
- Annual Leave (AL)
- Sick Leave (SL)
- Casual Leave (CL)
- Privilege Leave (PL)
- Maternity Leave (ML)
- Paternity Leave (PTL)
- Compensatory Off (CO)
- Loss of Pay (LOP)

**UI Layouts**:
- Applications: Timeline layout showing chronological history
- Balances: Card grid with circular progress indicators
- Types: Professional table with toggles

**API Endpoints**:
```
GET    /api/leave/applications
POST   /api/leave/applications
PUT    /api/leave/applications/{id}
DELETE /api/leave/applications/{id}

GET    /api/leave/balances?employeeId={id}
GET    /api/leave/types
POST   /api/leave/types
PUT    /api/leave/types/{id}
```

---

### 4. **Timesheet Module**

**Color Theme**: #722ed1 (Purple)
**Icon**: FieldTimeOutlined
**Routes**: `/admin/timesheet/*`

#### Features:

**Timesheet Entries**
- Weekly timesheet grid
- Project and task selection
- Daily hours logging
- Billable/non-billable tracking
- Description and notes
- Auto-save functionality
- Weekly submission
- Copy previous week

**Timesheet Approvals**
- Manager approval workflow
- Weekly submissions review
- Hours breakdown by project
- Approve/Reject/Request Changes
- Comments and feedback
- Approval history

**UI Layouts**:
- Entries: Calendar/week view grid
- Approvals: Card layout with project breakdown

**API Endpoints**:
```
GET    /api/timesheet/entries?employeeId={id}&week={date}
POST   /api/timesheet/entries
PUT    /api/timesheet/entries/{id}

GET    /api/timesheet/approvals
POST   /api/timesheet/approvals/{id}/approve
POST   /api/timesheet/approvals/{id}/reject
```

---

### 5. **Payroll Module**

**Color Theme**: #faad14 (Gold)
**Icon**: DollarOutlined
**Routes**: `/admin/payroll/*`

#### Features:

**Payroll Runs**
- Monthly/bi-weekly payroll processing
- Department-wise processing
- Employee selection
- Payroll preview before processing
- Processing status tracking
- Payroll history timeline
- Reprocess failed payrolls

**Payslips**
- Individual payslip generation
- Salary component breakdown
- Earnings and deductions
- Net salary calculation
- Tax calculations
- PDF generation and download
- Email distribution
- Payslip history

**Salary Components**
- Basic salary
- House Rent Allowance (HRA)
- Conveyance Allowance
- Medical Allowance
- Special Allowances
- Performance Bonus
- Provident Fund (PF)
- Professional Tax (PT)
- Income Tax (TDS)
- Custom components

**Component Configuration**:
- Component type (Earning/Deduction)
- Calculation type (Fixed/Percentage)
- Taxable status
- Active/inactive toggle

**UI Layouts**:
- Runs: Timeline with statistics cards
- Payslips: Card grid with salary breakdown
- Components: Professional table with type tags

**API Endpoints**:
```
GET    /api/payroll/runs
POST   /api/payroll/runs
GET    /api/payroll/runs/{id}

GET    /api/payroll/payslips?employeeId={id}
POST   /api/payroll/payslips
GET    /api/payroll/payslips/{id}/download

GET    /api/payroll/components
POST   /api/payroll/components
PUT    /api/payroll/components/{id}
```

---

### 6. **Performance Management Module**

**Color Theme**: #eb2f96 (Pink)
**Icon**: TrophyOutlined
**Routes**: `/admin/performance/*`

#### Features:

**Performance Reviews**
- Annual/quarterly review cycles
- 360-degree feedback
- Manager reviews
- Self-assessment
- Peer reviews
- Rating system (1-5 stars)
- Strengths and weaknesses
- Development areas
- Goal setting for next cycle

**Employee Goals**
- SMART goal setting
- Goal categories (Sales, Development, Marketing, etc.)
- Priority levels (High, Medium, Low)
- Progress tracking (0-100%)
- Target date tracking
- Status management (Not Started, In Progress, Completed)
- Kanban board visualization

**Review Cycles**
- Cycle creation and management
- Start and end dates
- Self-review deadlines
- Manager review deadlines
- Cycle status tracking
- Employee notifications

**UI Layouts**:
- Reviews: Card layout with star ratings
- Goals: Kanban board with drag & drop
- Cycles: Timeline view with progress bars

**API Endpoints**:
```
GET    /api/performance/reviews
POST   /api/performance/reviews
PUT    /api/performance/reviews/{id}

GET    /api/performance/goals?employeeId={id}
POST   /api/performance/goals
PUT    /api/performance/goals/{id}

GET    /api/performance/cycles
POST   /api/performance/cycles
PUT    /api/performance/cycles/{id}
```

---

### 7. **Recruitment Module**

**Color Theme**: #13c2c2 (Cyan)
**Icon**: TeamOutlined
**Routes**: `/admin/recruitment/*`

#### Features:

**Job Postings**
- Job title and description
- Rich text editor for job details
- Department and location
- Employment type (Full-time, Part-time, Contract, Internship)
- Experience requirements
- Skills tags
- Number of openings
- Salary range
- Benefits list
- Job status (Open, Closed, On Hold)
- Application tracking

**Job Applications**
- Candidate information
- Resume upload (PDF, DOC, DOCX)
- Cover letter
- Application source tracking
- Status management (Applied, Screening, Interview, Offer, Rejected)
- Candidate rating
- Interview scheduling link
- Application timeline

**Interview Schedules**
- Calendar view of all interviews
- Interview type (Phone, Video, In-person, Technical, HR)
- Date and time scheduling
- Interviewer selection (multiple)
- Meeting link for virtual interviews
- Interview notes and feedback
- Status tracking

**UI Layouts**:
- Jobs: Card grid with gradient headers
- Applications: Professional table with actions
- Interviews: Full calendar view

**API Endpoints**:
```
GET    /api/recruitment/jobs
POST   /api/recruitment/jobs
PUT    /api/recruitment/jobs/{id}

GET    /api/recruitment/applications
POST   /api/recruitment/applications
PUT    /api/recruitment/applications/{id}

GET    /api/recruitment/interviews
POST   /api/recruitment/interviews
PUT    /api/recruitment/interviews/{id}
```

---

### 8. **Asset Management Module**

**Color Theme**: #fa8c16 (Orange)
**Icon**: LaptopOutlined
**Routes**: `/admin/assets/*`

#### Features:

**Asset Management**
- Asset registration
- Asset tag generation
- Category assignment
- Serial number tracking
- Purchase date and cost
- Asset images upload
- Location tracking
- Status management (Available, Assigned, Maintenance, Retired)
- QR code generation
- Asset depreciation

**Asset Assignments**
- Assign assets to employees
- Assignment date tracking
- Expected return date
- Condition assessment (Excellent, Good, Fair, Poor)
- Assignment history timeline
- Return processing
- Overdue tracking

**Asset Categories**
- Category management
- Depreciation rate configuration
- Lifespan in years
- Asset count per category
- Category descriptions

**Common Asset Types**:
- Laptops
- Desktop Computers
- Monitors
- Mobile Phones
- Tablets
- Printers
- Furniture
- Vehicles

**UI Layouts**:
- Assets: Card grid with images and QR codes
- Assignments: Timeline view
- Categories: Professional table

**API Endpoints**:
```
GET    /api/assets/assets
POST   /api/assets/assets
PUT    /api/assets/assets/{id}

GET    /api/assets/assignments
POST   /api/assets/assignments
PUT    /api/assets/assignments/{id}

GET    /api/assets/categories
POST   /api/assets/categories
PUT    /api/assets/categories/{id}
```

---

### 9. **Expense Management Module**

**Color Theme**: #f5222d (Red)
**Icon**: WalletOutlined
**Routes**: `/admin/expenses/*`

#### Features:

**Expense Claims**
- Multi-item expense claims
- Category-wise expenses
- Receipt upload (images, PDF)
- Amount tracking
- Description and notes
- Claim date tracking
- Approval workflow
- Reimbursement status
- Claim history

**Expense Categories**
- Category creation
- Category codes
- Maximum amount limits
- Receipt requirement toggle
- Approval requirement toggle
- Active/inactive status

**Common Expense Categories**:
- Travel
- Accommodation
- Meals
- Transportation
- Fuel
- Communication
- Office Supplies
- Professional Development
- Client Entertainment

**UI Layouts**:
- Claims: Card layout with receipt previews
- Categories: Professional table with toggles

**API Endpoints**:
```
GET    /api/expenses/claims
POST   /api/expenses/claims
PUT    /api/expenses/claims/{id}

GET    /api/expenses/categories
POST   /api/expenses/categories
PUT    /api/expenses/categories/{id}
```

---

### 10. **Project Management Module**

**Color Theme**: #2f54eb (Blue)
**Icon**: ProjectOutlined
**Routes**: `/admin/projects/*`

#### Features:

**Projects**
- Project creation
- Project code generation
- Client assignment
- Project manager assignment
- Start and end dates
- Budget allocation
- Project status (Planning, Active, On Hold, Completed, Cancelled)
- Billable/non-billable toggle
- Progress tracking
- Team member management

**Project Tasks**
- Task creation
- Project assignment
- Task assignee
- Start date and due date
- Priority levels (High, Medium, Low)
- Status management (To Do, In Progress, Review, Done)
- Estimated hours
- Kanban board visualization
- Drag & drop status updates

**UI Layouts**:
- Projects: Card grid with progress bars
- Tasks: Kanban board with drag & drop

**API Endpoints**:
```
GET    /api/projects/projects
POST   /api/projects/projects
PUT    /api/projects/projects/{id}

GET    /api/projects/tasks
POST   /api/projects/tasks
PUT    /api/projects/tasks/{id}
```

---

## Access Control & Security

### User Roles

**1. SuperAdmin**
- System-wide access
- Organization management
- All administrative functions
- System configuration

**2. Organization Administrator (OrgAdmin)**
- Full access within organization
- Employee management
- All modules access
- Reports and analytics
- Configuration management

**3. Employee**
- Personal information access
- Document management
- Leave applications
- Timesheet entries
- Expense claims
- Limited read access

### Permission System

**Resource-Based Permissions**:
- Resource: employees, departments, leave, payroll, etc.
- Action: read, create, update, delete, approve
- Scope: own, department, organization, all

**Permission Groups**:
- HR Manager
- Finance Team
- Department Manager
- Team Lead
- Regular Employee

---

## Premium UI/UX Features

### Design System

**Theme Configuration**:
- Custom Ant Design tokens
- Module-specific color schemes
- Professional gradients
- Consistent typography
- Smooth animations

**Component Library**:
- PremiumCard with glass morphism
- StatisticCard with trends
- DashboardChart (line, area, bar, pie)
- EmptyState component
- Professional tables with filters

### Visual Excellence

**Color Palette**:
- Attendance: #1890ff (Blue)
- Leave: #52c41a (Green)
- Timesheet: #722ed1 (Purple)
- Payroll: #faad14 (Gold)
- Performance: #eb2f96 (Pink)
- Recruitment: #13c2c2 (Cyan)
- Assets: #fa8c16 (Orange)
- Expenses: #f5222d (Red)
- Projects: #2f54eb (Blue)

**UI Patterns**:
- Gradient backgrounds
- Card-based layouts
- Timeline visualizations
- Kanban boards
- Calendar views
- Progress indicators
- Status badges
- Hover effects
- Smooth transitions

### Responsive Design

- Mobile-first approach
- Responsive grid system
- Breakpoints: xs, sm, md, lg, xl
- Touch-friendly interactions
- Adaptive layouts

---

## Database Schema

### Core Tables (103 tables total)

**Authentication & Users**:
- `users` - User accounts
- `password_reset_tokens` - Password reset functionality
- `roles` - Role definitions
- `user_roles` - User-role mapping
- `permissions` - Permission definitions
- `role_permissions` - Role-permission mapping

**Organization Structure**:
- `organizations` - Multi-tenant organizations
- `departments` - Department hierarchy
- `positions` - Job positions
- `employees` - Employee master data
- `employee_history` - Employment history tracking

**Attendance**:
- `attendance_records` - Daily attendance
- `attendance_regularization_requests` - Regularization requests
- `shifts` - Shift definitions
- `employee_shifts` - Employee shift assignments
- `biometric_devices` - Device management
- `biometric_logs` - Device logs

**Leave Management**:
- `leave_types` - Leave type configuration
- `leave_applications` - Leave requests
- `leave_balances` - Employee leave balances
- `leave_transactions` - Balance transactions
- `holidays` - Holiday calendar
- `compensatory_off_credits` - Comp-off credits

**Timesheet**:
- `timesheet_entries` - Time entries
- `timesheet_summary` - Weekly summaries
- `projects` - Project master
- `project_tasks` - Project tasks

**Payroll**:
- `payroll_runs` - Payroll processing runs
- `payslips` - Employee payslips
- `payslip_line_items` - Payslip components
- `salary_components` - Component definitions
- `employee_salary_structures` - Employee-specific structures
- `tax_slabs` - Tax calculation

**Performance**:
- `performance_cycles` - Review cycles
- `performance_reviews` - Performance reviews
- `employee_goals` - Employee goals

**Recruitment**:
- `job_postings` - Job advertisements
- `job_applications` - Candidate applications
- `interview_schedules` - Interview planning
- `interview_feedback` - Interview notes
- `job_offers` - Offer letters

**Asset Management**:
- `assets` - Asset master
- `asset_categories` - Asset categorization
- `asset_assignments` - Assignment tracking
- `asset_maintenance` - Maintenance records

**Expenses**:
- `expense_claims` - Expense claims
- `expense_claim_items` - Claim line items
- `expense_categories` - Category master

**Documents**:
- `documents` - Document storage
- `document_requests` - Document requests

**Others**:
- `vendors` - Vendor management
- `clients` - Client management
- `notifications` - Notification system
- `audit_logs` - Audit trail

---

## API Documentation

### Authentication

**Login**:
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
Response: {
  "token": "jwt_token_here",
  "user": {...},
  "roles": ["orgadmin"]
}
```

**Set Password**:
```
POST /api/auth/set-password
{
  "token": "reset_token",
  "password": "newpassword123"
}
```

### Standard CRUD Pattern

All modules follow the same RESTful pattern:

```
GET    /api/{module}/{entity}              - List all
GET    /api/{module}/{entity}/{id}         - Get by ID
POST   /api/{module}/{entity}              - Create new
PUT    /api/{module}/{entity}/{id}         - Update
DELETE /api/{module}/{entity}/{id}         - Delete
```

### Query Parameters

- `?page=0&size=20` - Pagination
- `?sort=createdAt,desc` - Sorting
- `?search=keyword` - Search
- `?status=ACTIVE` - Filtering

---

## Deployment & Configuration

### Environment Variables

```properties
# Database
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=hrms
spring.datasource.username=sa
spring.datasource.password=password

# JWT
jwt.secret=your_secret_key_here
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Frontend
VITE_API_BASE_URL=http://localhost:8080
```

### Build & Run

**Backend**:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev          # Development
npm run build        # Production
```

---

## Features Summary

✅ **9 Core Modules**: Attendance, Leave, Timesheet, Payroll, Performance, Recruitment, Assets, Expenses, Projects
✅ **103+ Database Tables**: Comprehensive data model
✅ **200+ API Endpoints**: Full CRUD operations
✅ **70+ UI Pages**: Rich, premium interfaces
✅ **Multi-Tenancy**: Organization-level isolation
✅ **RBAC**: Flexible permission system
✅ **JWT Authentication**: Secure token-based auth
✅ **File Uploads**: Documents, receipts, resumes, images
✅ **Analytics**: Charts, statistics, reports
✅ **Audit Logs**: Complete audit trail
✅ **Responsive Design**: Mobile-friendly
✅ **Premium UI**: Professional, modern design
✅ **TypeScript**: Type-safe frontend
✅ **Spring Boot**: Enterprise-grade backend

---

## Page Count

**Total Pages**: 73 pages

### Breakdown by Module:
- Attendance: 6 pages (3 list + 3 forms)
- Leave: 5 pages (3 list + 2 forms)
- Timesheet: 4 pages (2 list + 2 forms)
- Payroll: 6 pages (3 list + 3 forms)
- Performance: 6 pages (3 list + 3 forms)
- Recruitment: 6 pages (3 list + 3 forms)
- Assets: 6 pages (3 list + 3 forms)
- Expenses: 4 pages (2 list + 2 forms)
- Projects: 4 pages (2 list + 2 forms)
- Employee Management: 8 pages
- Organization: 4 pages
- Access Control: 6 pages
- Documents: 4 pages
- Dashboards: 3 pages
- Authentication: 4 pages

---

## Future Enhancements

- Mobile app (React Native)
- Advanced analytics and BI dashboards
- AI-powered insights
- Employee self-service portal
- Manager dashboard
- Slack/Teams integration
- Calendar integration
- Email notifications
- SMS notifications
- Biometric device integration
- GPS-based attendance
- Advanced reporting
- Data export (Excel, PDF)
- Multi-language support
- Dark mode

---

## Support & Documentation

For detailed API documentation, visit: `/api/swagger-ui.html` (when Swagger is configured)

**Project Repository**: GitHub
**Issue Tracker**: GitHub Issues
**Wiki**: GitHub Wiki

---

**Last Updated**: November 2025
**Version**: 2.0.0
**License**: Proprietary
