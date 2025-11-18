# HRMS Portal - Complete Capabilities

## 🎯 Overview

A comprehensive, multi-tenant SaaS HRMS (Human Resource Management System) with enterprise-grade features including:
- Hierarchical permission system
- Document management with Azure Blob Storage
- Organization chart visualization
- Multi-country employee support
- Department-based employee codes
- Scoped visibility based on roles

---

## 👥 User Roles

### 1. SuperAdmin
**Purpose**: System-wide administration

**Capabilities**:
- ✅ Create and manage organizations
- ✅ View system-wide metrics (total employees, departments, users across all orgs)
- ✅ Create organization administrators
- ✅ Deactivate/Reactivate organizations
- ✅ Send automated credential emails
- ✅ Monitor per-organization statistics
- ✅ NO access to organization data (maintains separation)

### 2. Organization Admin (Org Admin)
**Purpose**: Organization-level management

**Capabilities**:
- ✅ View entire organization
- ✅ Create/edit/delete employees
- ✅ Manage organizational structure (departments, positions)
- ✅ Create and assign permission groups
- ✅ Request documents from any employee
- ✅ Approve/reject documents
- ✅ View organization chart
- ✅ Assign roles to users
- ✅ Reset employee passwords
- ✅ Manage vendors, clients, projects
- ✅ Bulk import employees
- ✅ View audit logs

### 3. Manager
**Purpose**: Team management

**Capabilities** (based on permissions):
- ✅ View team members' information
- ✅ View team documents
- ✅ Request documents from team members
- ✅ Approve team documents
- ✅ View team in org chart
- ✅ Update team assignments (if permitted)
- ❌ Cannot see other teams
- ❌ Cannot see other departments

### 4. Department Head
**Purpose**: Department-level management

**Capabilities** (based on permissions):
- ✅ View entire department
- ✅ View department documents
- ✅ Request documents from department members
- ✅ Approve department documents
- ✅ View department structure in org chart
- ❌ Cannot see other departments

### 5. Employee
**Purpose**: Individual contributor

**Capabilities**:
- ✅ View own profile
- ✅ Upload own documents
- ✅ Respond to document requests
- ✅ View own document history
- ✅ Change own password
- ✅ View own leave balance (if module active)
- ❌ Cannot view other employees
- ❌ Cannot request documents from others

---

## 🏢 Organization Management

### SuperAdmin Functions

#### Organization CRUD
- **Create Organization**:
  - Organization name
  - Auto-generated unique ID
  - Creation timestamp

- **View Organizations**:
  - List all organizations
  - Per-org metrics:
    - Employee count
    - Department count
    - Active user count
    - Document count
  - Active/Inactive status
  - Sortable and filterable table

- **Deactivate Organization**:
  - Soft delete (sets deletedAt timestamp)
  - Preserves all data
  - Can be reactivated

- **Reactivate Organization**:
  - Removes deletedAt timestamp
  - Restores access

#### Org Admin Management
- **Create Org Admin**:
  - Email address
  - Temporary password
  - Auto-assigned ORGADMIN role
  - Automated email with credentials
  - Must change password on first login

#### System-Wide Metrics
- **Active Organizations**: Count of non-deleted orgs
- **Total Employees**: Sum across all orgs
- **Total Departments**: Sum across all orgs
- **Active Users**: Sum of enabled users across all orgs

---

## 👔 Employee Management

### Employee Onboarding (60+ Fields)

#### Account Information
- Email (username)
- Temporary password
- Must change on first login

#### Personal Details (14 fields)
- First name, Middle name (optional), Last name
- Date of birth
- Gender
- Nationality
- Marital status
- Blood group
- Optional (can be updated later)

#### Contact Information (4 fields)
- Personal email
- Phone number
- Work phone
- Alternate phone

#### Address (13 fields)
- **Current Address**:
  - Line 1, Line 2
  - City, State, Country
  - Postal code
- **Permanent Address**:
  - Same as current (checkbox)
  - OR separate address
  - Line 1, Line 2, City, State, Country, Postal code

#### Emergency Contacts (6 fields)
- **Primary Contact**:
  - Name
  - Relationship
  - Phone
- **Alternate Contact**:
  - Name
  - Relationship
  - Phone

#### Employment Details (15+ fields)
- **Employee Code**: Auto-generated
  - Format: `{DEPT_CODE}{3-digit-number}`
  - Examples: IT001, HR025, FIN010
  - Fallback: EMP001
  - Sequential per department
  - Pessimistic locking prevents duplicates
- Joining date
- Department (with inline "Create New" option)
- Position (with inline "Create New" option)
- Reports to (Manager selection)
- Employment type: Internal/Vendor/Client
- Employment status: Active/On Leave/Terminated
- **Probation**:
  - Is on probation (boolean)
  - Start date, End date
  - Status: Active/Completed/Terminated
- **Contract** (for contractors):
  - Start date, End date
- **Vendor/Client/Project Assignment**:
  - Vendor dropdown
  - Client dropdown
  - Project dropdown
- **Permission Groups**: Multi-select

#### Compensation (6 fields)
- Basic salary
- Currency (USD, INR, EUR, GBP, etc.)
- Pay frequency (Monthly, Bi-weekly, etc.)
- All optional

#### Bank Details (6 fields)
- Bank account number
- Bank name
- Bank branch
- IFSC code (India)
- SWIFT code (International)
- All optional

#### Tax & Legal (1 field)
- Tax Identification Number

#### India-Specific KYC (3 fields)
- PAN number
- Aadhar number
- UAN number
- All optional

#### USA-Specific KYC (3 fields)
- SSN number
- Driver's license number
- Passport number
- All optional

#### Professional Profiles (2 fields)
- LinkedIn profile URL
- GitHub profile URL

#### Resignation/Exit (4 fields)
- Resignation date
- Last working date
- Exit reason
- Exit notes

#### Audit Trail (6 fields)
- Created at, Created by
- Updated at, Updated by
- Deleted at, Deleted by
- Auto-tracked

### Employee Operations

#### View Employee
- **List View**:
  - Paginated table (50 per page)
  - Search by name, email, code
  - Filter by department, position, status
  - Sort by any column

- **Detail View**:
  - 7-tab organization:
    1. Overview - Basic employment info
    2. Personal & Contact - Personal details, contact, address
    3. Emergency Contacts - Contact information
    4. Vendor/Client/Project - Assignments
    5. Compensation & Bank - Financial info
    6. Compliance & Legal - Tax, KYC, profiles
    7. Exit & Audit - Resignation, audit trail
  - Action buttons:
    - View Documents
    - Request Document
    - Edit Assignment
    - Permissions
    - Roles
    - Reset Password
    - History
    - Delete/Reactivate
    - Back

#### Update Employee
- **Edit Assignment**:
  - Change department
  - Change position
  - Change manager (reports to)
  - Change employment type
  - Change contract dates
- **Update Profile**:
  - Update personal details
  - Update contact information
  - Update address
  - Update bank details
  - Update KYC information

#### Delete Employee
- Soft delete (sets deletedAt timestamp)
- Preserves all data
- Shows as "Inactive" in lists
- Can be reactivated

#### Reactivate Employee
- Removes deletedAt timestamp
- Restores access

#### Bulk Import
- Upload CSV file
- Map columns to fields
- Validate data
- Preview before import
- Import employees in batch
- Error handling and reporting

---

## 🏗️ Organizational Structure

### Departments

#### Create Department
- Name (required)
- **Department Code** (2-6 uppercase letters):
  - Used for employee codes
  - Examples: IT, HR, FIN, MKT, OPS
  - Validation: Must be uppercase letters only
- Description
- isActive status

#### Manage Departments
- List all departments
- Filter by active/inactive
- View employee count per department
- Edit department details
- Soft delete departments

### Positions

#### Create Position
- Name (required)
- **Seniority Level** (1-9):
  - 1: Entry Level
  - 2: Junior
  - 3: Mid Level
  - 4: Senior
  - 5: Lead
  - 6: Manager
  - 7: Director
  - 8: VP
  - 9: C-Level
- Description
- Used for org chart visualization

#### Manage Positions
- List all positions
- Filter by level
- View employee count per position
- Edit position details
- Soft delete positions

---

## 🔐 Permission System

### Permission Groups

#### Create Permission Group
- Group name (e.g., "Managers", "HR Team")
- Description
- Assign permissions from available list

#### Permission Scopes
- **`own`**: User's own data only
- **`team`**: User's direct reports
- **`department`**: Entire department
- **`organization`**: All employees in org

#### Available Permissions

**Employee Permissions**:
- `employees:view:own` - View own profile
- `employees:view:team` - View team members
- `employees:view:department` - View department members
- `employees:view:organization` - View all employees
- `employees:create:organization` - Create employees
- `employees:edit:own` - Edit own profile
- `employees:edit:team` - Edit team members
- `employees:edit:organization` - Edit any employee
- `employees:delete:organization` - Delete employees

**Document Permissions**:
- `documents:view:own` - View own documents
- `documents:view:team` - View team documents
- `documents:view:department` - View department documents
- `documents:view:organization` - View all documents
- `documents:upload:own` - Upload own documents
- `documents:upload:team` - Upload for team
- `documents:request:team` - Request from team
- `documents:request:department` - Request from department
- `documents:request:organization` - Request from anyone
- `documents:approve:team` - Approve team documents
- `documents:approve:department` - Approve department documents
- `documents:approve:organization` - Approve all documents

**Structure Permissions**:
- `structure:view:organization` - View departments, positions
- `structure:manage:organization` - Create/edit departments, positions

**Permission Permissions**:
- `permissions:view:organization` - View permission groups
- `permissions:manage:organization` - Create/edit permission groups
- `permissions:assign:organization` - Assign groups to users

**Role Permissions**:
- `roles:view:organization` - View roles
- `roles:assign:organization` - Assign roles to users

#### Assign Permission Groups
- Multi-select groups for each employee
- Groups are additive (permissions combine)
- Applied immediately
- Effective permissions calculated dynamically

### Roles (Complementary System)

#### Available Roles
- **SUPERADMIN**: System-wide access (outside organizations)
- **ORGADMIN**: Organization-level access (full org permissions)
- **EMPLOYEE**: Basic user (must have permission groups for additional access)

#### Assign Roles
- Org Admin can assign ORGADMIN or EMPLOYEE
- SuperAdmin can assign SUPERADMIN
- Multiple roles possible (but typically one per user)

---

## 📄 Document Management

### Document Upload

#### Upload Own Document
- Navigate to Documents page
- Tab: "My Documents"
- Click "Upload My Document"
- Select file from computer
- Optionally link to document request
- File stored in Azure Blob Storage

#### Upload for Employee (Org Admin)
- Navigate to Documents page
- Click "Upload for Employee"
- Select employee
- Select file
- Optionally link to request
- File stored with employee association

### Document Storage

#### Azure Blob Storage
- **Connection String**: From environment variable
- **Container**: Configurable per deployment
- **Path Structure**: `org/{orgId}/employee/{empId}/{year}/{month}/{UUID}_{filename}`
  - Example: `org/123/employee/456/2025/11/abc-def_passport.pdf`
- **File Validation**:
  - Max size: 10MB (configurable)
  - Allowed types: PDF, DOCX, XLSX, JPG, PNG
  - Virus scanning (placeholder for integration)
- **Automatic Organization**: Year/month folders for easy archival

### Document Viewing

#### Scoped Views (Hierarchical)
- **My Documents Tab**:
  - Shows only user's own uploads
  - No employee filter needed

- **Organization Documents Tab**:
  - **Employee**: Not visible (no permission)
  - **Manager**: Filtered to team members
  - **Dept Head**: Filtered to department
  - **Org Admin**: Shows all org documents
  - Info banner explains scoping

#### Document Actions
- **Preview**: View in browser (supported formats)
- **Download**: Save to local machine
- **Approve**: Mark as approved (if has permission)
- **Reject**: Mark as rejected with reason
- **Replace**: Upload new version
- **Delete**: Soft delete (Org Admin only)

### Document Approval Workflow

#### Document States
- **PENDING**: Just uploaded, not reviewed
- **APPROVED**: Reviewed and accepted
- **REJECTED**: Reviewed and declined (with reason)

#### Approval Process
1. Employee uploads document
2. Appears in manager's "Organization Documents" (if has permission)
3. Manager reviews (preview)
4. Manager approves or rejects:
   - **Approve**: Status → APPROVED
   - **Reject**: Enter reason, Status → REJECTED
5. Employee sees updated status in "My Documents"

---

## 📋 Document Request System

### Request Documents

#### Create Request
- Click "Request Document" button
- Modal opens
- Select employee from dropdown
- Enter message/description:
  - "Please upload your ID proof"
  - "Need your tax documents for filing"
  - "Educational certificates required"
- Submit → Request created with status "REQUESTED"

#### Request Views (Scoped Tabs)

**Tab 1: Incoming Requests** (Requests TO me)
- Shows requests where I am the target
- Badge shows count of pending requests
- Actions:
  - Complete (upload document)
  - Reject
- Status colors: Orange (Requested), Green (Completed), Red (Rejected)

**Tab 2: My Requests** (Outgoing)
- Shows requests I created
- Tracks status of requests I made
- Can see when employee completes
- No actions (waiting for employee response)

**Tab 3: Organization Requests** (Based on permissions)
- **Employee**: Not visible
- **Manager**: Shows requests within team
- **Dept Head**: Shows requests within department
- **Org Admin**: Shows all org requests
- Info banner explains scoping
- Can see all parties involved

#### Request Lifecycle
```
Created (REQUESTED)
       ↓
Employee uploads document
       ↓
Status → COMPLETED
       ↓
Document appears in manager's view
       ↓
Manager approves document
       ↓
Workflow complete
```

#### Request Status Updates
- **REQUESTED**: Pending upload
- **COMPLETED**: Employee uploaded
- **REJECTED**: Employee declined to upload

---

## 📊 Organization Chart

### Visual Hierarchy

#### Chart Features
- **Tree Structure**: Visual representation of reporting relationships
- **Root Employees**: Those without managers (CEOs, Founders)
- **Branches**: Show manager → employee connections
- **Multi-Root Support**: Multiple top-level employees displayed side-by-side

#### Node Display
Each employee card shows:
- Avatar icon
- Employee name
- Employee code (e.g., IT001)
- Position (blue tag)
- Department (green tag)
- Direct report count

#### Visual Elements
- **Connecting Lines**: Visual lines between manager and reports
- **Horizontal Layout**: Siblings displayed side-by-side
- **Vertical Layout**: Manager above, reports below
- **Color Coding**:
  - Position tags: Blue
  - Department tags: Green
  - Avatars: Primary blue

#### Interactions
- **Click Node**: Navigate to employee detail page
- **Scroll**: Horizontal and vertical scrolling for large orgs
- **Hover**: Card highlights on hover
- **Back Button**: Return to employee list

#### Data Structure
```json
{
  "nodes": [
    {
      "id": "employee-uuid",
      "employeeCode": "IT001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "positionName": "Software Engineer",
      "positionLevel": 3,
      "departmentName": "Engineering",
      "departmentCode": "IT",
      "reportsToId": "manager-uuid",
      "directReportCount": 2
    }
  ],
  "rootEmployeeIds": ["ceo-uuid"],
  "totalEmployees": 150
}
```

---

## 🔍 Search & Filtering

### Employee Search
- **Search Fields**:
  - Name (first, middle, last)
  - Email
  - Employee code
- **Live Search**: Updates as you type
- **Fuzzy Matching**: Finds partial matches

### Employee Filters
- Department (multi-select)
- Position (multi-select)
- Employment type (Internal/Vendor/Client)
- Employment status (Active/On Leave/Terminated)
- Probation status
- Manager (select specific manager)

### Document Filters
- Approval status (Pending/Approved/Rejected)
- Date range (created date)
- Employee (if viewing org documents)

### Sorting
- All table columns sortable
- Ascending/descending
- Multi-column sort (hold shift)

---

## 🔒 Security Features

### Authentication
- **JWT-based**: Stateless authentication
- **Token Expiry**: Configurable timeout
- **Refresh Tokens**: Long-lived for session persistence
- **Secure Password Storage**: BCrypt hashing
- **Forced Password Change**: After temporary password login

### Authorization
- **Role-Based Access Control (RBAC)**: SuperAdmin, OrgAdmin, Employee roles
- **Permission-Based Access Control (PBAC)**: Fine-grained permissions
- **Hierarchical Scoping**: Own → Team → Department → Organization
- **Backend Enforcement**: Permissions checked on every API call
- **Organization Isolation**: Multi-tenant with strict isolation

### Data Security
- **Soft Deletes**: No data permanently deleted
- **Audit Trail**: All changes tracked with user and timestamp
- **SQL Injection Protection**: JPA query protection
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Restricted origins in production

### File Security
- **File Validation**: Type and size checks
- **Secure Storage**: Azure Blob Storage with encryption
- **Access Control**: Scoped document access
- **Virus Scanning**: Integration point available

---

## 📧 Email Integration

### Automated Emails

#### Org Admin Creation
- **Trigger**: SuperAdmin creates org admin
- **Content**:
  - Organization name
  - Login email
  - Temporary password
  - Login link
- **Sender**: System email

#### Document Request Notification
- **Trigger**: Document request created
- **Recipient**: Target employee
- **Content**:
  - Requester name
  - Request message
  - Link to upload

#### Password Reset
- **Trigger**: Org admin resets employee password
- **Recipient**: Employee
- **Content**:
  - New temporary password
  - Must change on login

### Email Service
- **Provider**: Configurable (SMTP, SendGrid, etc.)
- **Templates**: HTML email templates
- **Failure Handling**: Logs error, doesn't block user creation
- **Retry Logic**: Configurable retry attempts

---

## 📈 Dashboard & Analytics

### SuperAdmin Dashboard
- **System-Wide Metrics** (cards):
  - Active Organizations
  - Total Employees (all orgs)
  - Total Departments (all orgs)
  - Active Users (all orgs)
- **Per-Organization Metrics** (table):
  - Employee count
  - Department count
  - User count
  - Document count
  - Status (Active/Inactive)
- **Visual Elements**:
  - Color-coded statistics
  - Icons for each metric type
  - Sortable and filterable

### Org Admin Dashboard
- **Organization Metrics** (cards):
  - Total Employees
  - Active Employees
  - Departments
  - Pending Document Requests
- **Quick Actions**:
  - Create Employee
  - View Organization Chart
  - Manage Permissions
  - View Documents
- **Recent Activity**:
  - New employees
  - Pending approvals
  - Expiring contracts

### Employee Dashboard
- **Personal Info** (card):
  - Employee code
  - Department, Position
  - Manager
- **Pending Actions**:
  - Document requests to complete
  - Password change reminders
- **Quick Links**:
  - View Profile
  - Upload Document
  - View Documents

---

## 🎨 UX Principles Implemented

### 1. Hierarchical Visibility
- **Default Scoped Views**: Users see what's relevant to them
- **Drill-Down Capability**: Higher permissions can access more data
- **Clear Communication**: Banners explain what's being shown
- **No Information Overload**: CEO doesn't see every detail by default

### 2. Separate Workflows
- **Dedicated Pages**: Documents viewing vs. requesting are separate
- **No Feature Creep**: Employee detail page doesn't show full document list
- **Clear Navigation**: Tab-based organization within pages
- **Action Buttons**: Clear CTAs for each workflow

### 3. Clean, Modern UI
- **Badge Counts**: At-a-glance status indicators
- **Color Coding**: Consistent colors for types (blue=employees, green=departments, orange=documents)
- **Icons**: Visual indicators for all entity types
- **Empty States**: Helpful messages with CTAs when no data
- **Compact Cards**: Information-dense without clutter
- **Responsive Layout**: Works on desktop and tablet

### 4. Progressive Disclosure
- **Tabbed Content**: 7 tabs in employee detail instead of one long page
- **Expandable Sections**: Show less, expand for more
- **Modal Forms**: Complex forms in modals instead of inline
- **Wizard Pattern**: 8-step employee creation instead of one massive form

### 5. Feedback & Validation
- **Inline Validation**: Real-time field validation
- **Clear Error Messages**: Helpful, actionable errors
- **Success Notifications**: Toast messages for completed actions
- **Loading States**: Spinners and skeletons during data fetch
- **Confirmation Dialogs**: Before destructive actions

---

## 🚀 Technical Capabilities

### Backend
- **Framework**: Spring Boot 3.2.0
- **Database**: SQL Server with JPA/Hibernate
- **API**: RESTful JSON APIs
- **Authentication**: JWT with Spring Security
- **File Storage**: Azure Blob Storage
- **Soft Deletes**: All entities support soft deletion
- **Audit Trails**: Automatic tracking of created/updated/deleted by

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios
- **Form Validation**: Ant Design Form with custom rules

### Multi-Tenancy
- **Organization-Based**: Each org is a separate tenant
- **Data Isolation**: Queries always filter by organization
- **Shared Schema**: Single database, isolated by foreign key
- **Cross-Tenant Protection**: Backend enforces org boundaries

### Scalability
- **Pagination**: All lists paginated (50 items per page)
- **Lazy Loading**: Data fetched on-demand
- **Efficient Queries**: JPA optimization with fetch joins
- **Blob Storage**: Offloads file storage from database
- **Pessimistic Locking**: Prevents race conditions (employee codes)

---

## 🔧 Configuration & Deployment

### Environment Variables

**Backend** (`application.properties`):
```properties
# Database
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Azure Blob Storage
storage.azure.connection-string=${STORAGE_AZURE_CONNECTION_STRING}
storage.azure.container=${STORAGE_AZURE_CONTAINER}

# Email
spring.mail.host=${MAIL_HOST}
spring.mail.port=${MAIL_PORT}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:8080
```

### Database Schema
- **Auto-Migration**: JPA handles schema updates
- **Soft Delete Pattern**: `deleted_at` column on all entities
- **Audit Trail**: `created_at`, `created_by`, `updated_at`, `updated_by` on all entities
- **UUIDs**: Primary keys for all entities
- **Foreign Keys**: Strict referential integrity

---

## 🎁 Additional Features

### Employee Code Generation
- **Department-Based**: Uses department code as prefix
- **Sequential**: 3-digit sequential number per department
- **Format**: `{DEPT_CODE}{3-DIGIT-NUMBER}`
  - IT001, IT002, ..., IT999
  - HR001, HR002, ...
  - FIN001, FIN002, ...
- **Fallback**: EMP001 if no department
- **Thread-Safe**: Pessimistic locking prevents duplicates
- **Auto-Generation**: Triggered on department selection
- **Manual Override**: Can be changed before saving

### Inline Creation
- **Create Department**: From employee creation wizard
  - Modal opens
  - Create department
  - Automatically selected in form
- **Create Position**: From employee creation wizard
  - Modal opens
  - Create position
  - Automatically selected in form

### Multi-Country Support
- **Optional KYC Fields**: Can be filled later
- **Country-Specific**:
  - India: PAN, Aadhar, UAN
  - USA: SSN, Driver's License, Passport
- **Flexible**: All compliance fields optional
- **Extendable**: Easy to add more countries

### Probation Management
- **During Onboarding**: Mark as probation employee
- **Track Dates**: Start and end dates
- **Status**: Active/Completed/Terminated
- **Actions**:
  - Extend probation with new end date
  - Complete probation early
  - Terminate probation
- **Visible in Detail**: Tab 4 shows probation info and actions

### Contract Management
- **Contract Dates**: Start and end dates
- **Expiry Tracking**: Can filter by expiring contracts
- **Renewal Workflow**: Update end date to extend
- **Visible in Detail**: Tab 1 shows contract info

### Vendor/Client/Project Tracking
- **Vendor Assignment**: Track vendor employees
- **Client Assignment**: Track client projects
- **Project Assignment**: Link to specific projects
- **Reporting**: Filter employees by vendor/client/project
- **Visible in Detail**: Tab 4 shows all assignments

---

## 📋 Summary: What Can the Application Do?

### Core Functions
✅ **Multi-Tenant SaaS**: Multiple organizations in one system
✅ **Complete Employee Lifecycle**: Onboarding → Management → Exit
✅ **60+ Employee Fields**: Comprehensive employee records
✅ **Department-Based Employee Codes**: Auto-generated, sequential
✅ **Hierarchical Permissions**: Own → Team → Department → Organization
✅ **Document Management**: Upload, request, approve, store in Azure Blob
✅ **Organization Chart**: Visual hierarchy of reporting relationships
✅ **Multi-Country Support**: India, USA, extensible
✅ **Vendor/Client/Project**: Track external assignments
✅ **Probation Management**: Track and manage probation periods
✅ **Contract Management**: Track contract dates and renewals
✅ **Audit Trail**: Complete history of all changes
✅ **Soft Deletes**: No permanent data loss
✅ **Email Notifications**: Automated credential and request emails
✅ **Bulk Import**: CSV upload for mass employee creation
✅ **Role-Based + Permission-Based**: Dual authorization system
✅ **Scoped Visibility**: Users see only what they need
✅ **Inline Creation**: Create dependencies during workflow
✅ **System-Wide Analytics**: SuperAdmin dashboard with metrics
✅ **Org-Level Analytics**: Org Admin dashboard with org metrics

### What Makes It Special
🎯 **Clean UX**: No clutter, separate workflows, scoped defaults
🎯 **Enterprise-Ready**: Hierarchical permissions, audit trails, soft deletes
🎯 **Scalable**: Multi-tenant, paginated, optimized queries
🎯 **Flexible**: Multi-country, optional fields, extensible
🎯 **Secure**: JWT auth, permission checks, data isolation
🎯 **Complete**: End-to-end employee management
🎯 **Visual**: Org chart, stat cards, color coding
🎯 **Thoughtful**: Badge counts, empty states, inline creation
