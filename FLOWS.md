# HRMS Portal - Complete User Flows

## Flow 1: SuperAdmin Creates Organization (FIRST FLOW)

**Purpose**: Set up a new organization in the system

### Steps:
1. **SuperAdmin logs in** → `/login` with SuperAdmin credentials
2. **Navigate to Organizations** → `/superadmin/organizations`
   - View all organizations with metrics:
     - Total employees per org
     - Total departments per org
     - Active users per org
     - Document count per org
   - System-wide statistics cards at the top
3. **Click "Create Organization"** → `/superadmin/create-organization`
4. **Enter organization name** → e.g., "Acme Corp"
5. **Submit** → Organization created with unique ID
6. **Create Org Admin** → Click "Add Admin" button
   - Navigate to `/superadmin/orgadmin/{orgId}`
   - Enter org admin email
   - Enter temporary password
   - Submit → Creates user with ORGADMIN role
   - **Email sent automatically** with credentials
7. **Org Admin receives email** with login credentials

**Result**: Organization exists, Org Admin can now log in

---

## Flow 2: Org Admin First Login (SECOND FLOW)

**Purpose**: Org Admin sets up their organization structure

### Steps:
1. **Org Admin logs in** → `/login` with emailed credentials
2. **Forced password change** → Must change temporary password
3. **Dashboard** → See org overview:
   - Employee count
   - Department count
   - Document requests pending
   - Quick actions

### Org Admin Setup Tasks:

#### 2a. Create Departments
1. Navigate to **Structure → Departments** → `/admin/structure/departments`
2. Click "Create Department"
3. Enter:
   - Department name (e.g., "IT", "HR", "Finance")
   - Department code (2-6 uppercase letters) - **Used for employee codes**
   - Description
4. Submit → Department created

#### 2b. Create Positions
1. Navigate to **Structure → Positions** → `/admin/structure/positions`
2. Click "Create Position"
3. Enter:
   - Position name (e.g., "Software Engineer", "HR Manager")
   - Seniority level (1-9: Entry to C-Level)
   - Description
4. Submit → Position created

#### 2c. Create Permission Groups
1. Navigate to **Permissions → Groups** → `/admin/permissions/groups`
2. Create groups like "Managers", "HR Team", "Finance Team"
3. Assign permissions for each group:
   - `employees:view:own` - See own data
   - `employees:view:team` - See team members
   - `employees:view:department` - See department
   - `employees:view:organization` - See all employees
   - Similar for documents, requests, etc.

---

## Flow 3: Employee Onboarding (MAIN FLOW)

**Purpose**: Add a new employee to the system

### Steps:
1. **Navigate to Employees** → `/admin/employees`
2. **Click "Create Employee"** → `/admin/employees/create`
3. **8-Step Wizard**:

#### Step 1: Account Information
- Email (will be username)
- Temporary password
- First name, Middle name (optional), Last name

#### Step 2: Personal Details
- Date of birth
- Gender
- Nationality
- Marital status
- Blood group

#### Step 3: Contact Information
- Personal email
- Phone number
- Work phone
- Alternate phone

#### Step 4: Address
- Current address (line 1, line 2, city, state, country, postal code)
- Permanent address (checkbox: "Same as current")

#### Step 5: Emergency Contact
- Name, Relationship, Phone
- Alternate contact (optional)

#### Step 6: Employment Details
- **Employee Code**: Auto-generated based on department
  - Format: `{DEPT_CODE}{3-digit-number}`
  - Examples: IT001, HR025, FIN010
  - Fallback: EMP001 if no department
- Joining date
- **Department**: Select from dropdown
  - "Create New Department" button at bottom
- **Position**: Select from dropdown
  - "Create New Position" button at bottom
- Reports to (Manager)
- Employment type (Internal/Vendor/Client)
- Employment status (Active/On Leave/Terminated)
- **Vendor/Client/Project Assignment** (dropdowns)
- **Probation**:
  - Is on probation?
  - Start date, End date, Status
- **Contract dates** (if contractor)
- **Permission Groups**: Multi-select

#### Step 7: Additional Information (ALL OPTIONAL)
- **Compensation**:
  - Basic salary
  - Currency
  - Pay frequency
- **Bank Details**:
  - Account number
  - Bank name, Branch
  - IFSC code (India)
  - SWIFT code (International)
- **Tax & Legal**:
  - Tax Identification Number
- **India-Specific**:
  - PAN number
  - Aadhar number
  - UAN number
- **USA-Specific**:
  - SSN number
  - Driver's license number
  - Passport number
- **Professional Profiles**:
  - LinkedIn
  - GitHub

#### Step 8: Review
- Show all entered data
- Confirm and submit

4. **Submit** → Employee created
   - User account created with temporary password
   - Employee record with all 60+ fields
   - Assigned to department, position, manager
   - Permission groups applied

**Result**: Employee exists in system, can log in

---

## Flow 4: Employee First Login

**Purpose**: Employee accesses their account

### Steps:
1. **Log in** → `/login` with credentials
2. **Change password** → Forced change from temporary password
3. **Employee Dashboard** → See:
   - Personal info
   - Upcoming tasks
   - Document requests (incoming)
   - Leave balance (if module active)
4. **Navigate to Profile** → View own details
5. **View Documents** → See own uploaded documents

---

## Flow 5: Document Request & Upload Flow

**Purpose**: Manager requests documents from employee, employee uploads

### 5a. Manager Requests Document

#### Steps:
1. **Navigate to Document Requests** → `/document-requests`
2. **Tab: "My Requests" (Outgoing)**
3. **Click "Request Document"** → Opens modal
4. **Select employee** from dropdown
5. **Enter message** → e.g., "Please upload your ID proof"
6. **Submit** → Request created with status "REQUESTED"

### 5b. Employee Receives & Uploads

#### Steps:
1. **Employee logs in**
2. **Navigate to Document Requests** → `/document-requests`
3. **Tab: "Incoming Requests"** → See pending requests
   - Badge shows count of pending requests
4. **Click "Upload" / "Complete"**
5. **Select file** → Browse from computer
6. **Upload** → File stored in Azure Blob Storage
   - Path: `org/{orgId}/employee/{empId}/{year}/{month}/{UUID}_{filename}`
7. **Request status** → "COMPLETED"

### 5c. Manager Reviews Document

#### Steps:
1. **Navigate to Documents** → `/documents`
2. **Tab: "Organization Documents"** → Scoped by permissions
   - Manager sees team documents
   - Dept head sees department documents
   - Org admin sees all org documents
3. **Find employee's document**
4. **Preview** → View in browser
5. **Download** → Save locally
6. **Approve or Reject**:
   - Approve → Status: "APPROVED"
   - Reject → Enter reason, Status: "REJECTED"

**Result**: Document uploaded, approved, stored in Azure Blob

---

## Flow 6: Hierarchical Permission-Based Views

**Purpose**: Users see data based on their scope

### How It Works:

#### Employee (Default User)
- **Documents**: Sees only own documents
- **Document Requests**: Sees only requests TO them
- **Employees**: Cannot view others

#### Manager (has `employees:view:team`)
- **Documents**:
  - Tab "My Documents" → Own uploads
  - Tab "Organization Documents" → Team members' documents only
- **Document Requests**:
  - Tab "Incoming" → Requests to them
  - Tab "My Requests" → Requests they made
  - Tab "Organization Requests" → Requests within their team
- **Employees**: Can view team members
- **Org Chart**: Can see team structure

#### Department Head (has `employees:view:department`)
- **Documents**: Sees entire department's documents
- **Document Requests**: Sees all requests within department
- **Employees**: Can view entire department
- **Can request documents** from anyone in department

#### Org Admin (has `employees:view:organization`)
- **Documents**: Sees ALL organization documents
- **Document Requests**: Sees ALL requests in organization
- **Employees**: Can view, create, edit, delete all employees
- **Can request documents** from anyone
- **Dashboard shows** org-wide metrics

### Drill-Down Capability
- CEO has org-level permissions by default
- Can view everything if needed
- But default views are scoped to avoid information overload
- "You're seeing documents you have permission to access" message shown

---

## Flow 7: Employee Detail View

**Purpose**: View comprehensive employee information

### Steps:
1. **Navigate to Employees** → `/admin/employees`
2. **Click on employee** → `/admin/employees/{id}`
3. **View 7 Tabs**:

#### Tab 1: Overview
- Basic employment info
- Department, Position
- Manager (reporting to)
- Employment type/status
- Contract dates
- Probation info

#### Tab 2: Personal & Contact
- Personal details (DOB, gender, nationality, etc.)
- Contact information (emails, phones)
- Current address
- Permanent address

#### Tab 3: Emergency Contacts
- Primary contact
- Alternate contact

#### Tab 4: Vendor/Client/Project
- Vendor assignment
- Client assignment
- Project assignment
- Probation management buttons

#### Tab 5: Compensation & Bank
- Salary information
- Bank account details

#### Tab 6: Compliance & Legal
- Tax IDs
- India-specific KYC (PAN, Aadhar, UAN)
- USA-specific KYC (SSN, Driver's license, Passport)
- Professional profiles

#### Tab 7: Exit & Audit
- Resignation details
- Last working day
- Exit reason/notes
- Audit trail (created by, updated by, deleted by with timestamps)

4. **Action Buttons**:
   - **View Documents** → Navigate to documents page (filtered to employee)
   - **Request Document** → Quick request modal
   - **Edit Assignment** → Change dept/position/manager
   - **Permissions** → Manage permission groups
   - **Roles** → Assign system roles
   - **Reset Password** → Generate new temp password
   - **History** → View change history
   - **Delete** → Soft delete (or Reactivate if deleted)

---

## Flow 8: Organization Chart View

**Purpose**: Visual hierarchy of reporting relationships

### Steps:
1. **Navigate to Organization Chart** → `/admin/org-chart`
2. **See visual tree**:
   - Root employees at top (those without managers)
   - Branches show reporting relationships
   - Cards show:
     - Employee name
     - Employee code
     - Position (blue tag)
     - Department (green tag)
     - Direct report count
3. **Click on any employee** → Navigate to their detail page
4. **Scroll** horizontally/vertically for large orgs

**Visual Structure**:
```
      [CEO]
        |
   +---------+
   |         |
[VP Eng]  [VP Sales]
   |         |
+----+      +---+
|    |      |   |
[L1] [L2]  [L3] [L4]
```

---

## Flow 9: SuperAdmin Monitoring

**Purpose**: SuperAdmin oversees all organizations

### Steps:
1. **Navigate to Organizations** → `/superadmin/organizations`
2. **View System-Wide Metrics** (stat cards):
   - Active Organizations count
   - Total Employees across all orgs
   - Total Departments across all orgs
   - Total Active Users across all orgs
3. **View Per-Org Metrics** (table):
   - Employee count
   - Department count
   - Active user count
   - Document count
   - Status (Active/Inactive)
4. **Actions**:
   - Add Organization Admin
   - Delete Organization (soft delete)
   - Reactivate Organization
5. **Filter** by Active/Inactive

---

## Flow 10: Vendor/Client/Project Management

**Purpose**: Track external assignments

### Steps:
1. **Create Vendors** → `/admin/vendors`
2. **Create Clients** → `/admin/clients`
3. **Create Projects** → `/admin/projects`
4. **Assign During Onboarding** (Step 6 of employee creation):
   - Select Vendor (if vendor employee)
   - Select Client (if working on client project)
   - Select Project
5. **View in Employee Detail** → Tab 4 shows assignments
6. **Filter Employees** by vendor/client/project

---

## Key UX Principles Applied

### 1. Scoped Visibility
- **Default View**: Relevant to user's role (manager sees team, not entire org)
- **Drill-Down**: CEO can access everything if needed
- **Clear Indication**: Banners explain permission-based filtering

### 2. Separate Workflows
- **Viewing vs Requesting**: Different pages for different actions
- **No Clutter**: Employee detail page has "View Documents" button, not a huge documents section
- **Tabbed Organization**: 7 tabs in employee detail instead of endless scrolling

### 3. Hierarchical Permissions
- **Own → Team → Department → Organization**: Clear scopes
- **Backend Filtering**: Backend enforces permissions, UI reflects it
- **Permission Groups**: Reusable groups instead of per-user permissions

### 4. Clean, Modern UI
- **Badge Counts**: At-a-glance status (pending requests, document counts)
- **Empty States**: Helpful messages when no data
- **Call-to-Action**: Empty states have buttons to create first item
- **Consistent Icons**: Color-coded (employees blue, departments green, etc.)
- **Compact Cards**: Information-dense but not overwhelming

---

## Data Flow Summary

```
SuperAdmin
  └─> Creates Organization
       └─> Creates Org Admin
            └─> Org Admin sets up:
                 ├─> Departments (IT, HR, Finance)
                 ├─> Positions (Engineer, Manager)
                 ├─> Permission Groups (Managers, HR Team)
                 └─> Onboards Employees
                      ├─> Employee Code: IT001, HR025
                      ├─> Assigned to Dept, Position, Manager
                      ├─> Permission Groups applied
                      └─> Employees can:
                           ├─> View own data
                           ├─> Upload documents
                           ├─> Respond to requests
                           └─> (Managers can):
                                ├─> View team data
                                ├─> Request documents
                                ├─> Approve documents
                                └─> View org chart
```

---

## Document Storage Flow

```
Request Created → Employee Uploads → Stored in Azure Blob
                                           ↓
                   Path: org/{orgId}/employee/{empId}/{year}/{month}/{UUID}_{filename}
                                           ↓
                   Manager Reviews → Approves/Rejects
                                           ↓
                   Document status updated → Visible in scoped views
```

---

## Permission Inheritance

```
Permission Group: "Managers"
  ├─> employees:view:team
  ├─> documents:view:team
  ├─> documents:request:team
  └─> documents:approve:team

User assigned to "Managers" group
  └─> Inherits all permissions
       └─> UI adapts:
            ├─> Documents page shows "Organization Documents" tab
            ├─> Tab filtered to team members only
            ├─> Can approve team documents
            └─> Cannot approve other departments' documents
```
