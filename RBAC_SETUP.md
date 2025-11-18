# RBAC System Setup Guide

## Overview

This HRMS application has a comprehensive **Role-Based Access Control (RBAC)** system with **hierarchical permissions**. This guide explains how to set up and use the system effectively.

---

## Three Core Roles

### 1. **Super Admin**
- **First user** in the entire application
- Manages the platform and sells it to different organizations
- Creates organizations and organization admins
- Has access to all organizations in the system

### 2. **Organization Admin (Org Admin)**
- Administrator of a specific organization
- Created by Super Admin when a new organization is set up
- Has full access within their organization
- Can create employees, manage permissions, and configure organizational structure

### 3. **Employee**
- All users within an organization (including HR, managers, team leads, etc.)
- Permissions are customizable based on their role
- Can be assigned to **Permission Groups** for easy access control

---

## Permission System

### Permission Format: `resource:action:scope`

#### Resources
- `employees` - Employee data
- `documents` - Document files
- `document-requests` - Document requests
- `departments` - Department management
- `positions` - Position/job titles
- `vendors` - Vendor companies
- `clients` - Client companies
- `projects` - Projects
- `roles` - Role management
- `permissions` - Permission management
- `audit-logs` - System audit logs

#### Actions
- `view` - Read access
- `edit` - Modify existing data
- `create` - Create new records
- `delete` - Remove records
- `approve` - Approve requests/documents
- `upload` - Upload files
- `request` - Create requests
- `grant` - Grant permissions
- `revoke` - Revoke permissions

#### Scopes (Hierarchical)
1. **own** - User's own data only
2. **team** - User's direct reports (includes all descendants in reporting tree)
3. **department** - All employees in the same department
4. **organization** - All employees in the organization

**Example Permissions:**
- `employees:view:own` - Can view own employee profile
- `employees:view:team` - Can view all direct reports (manager can see their team)
- `employees:edit:department` - Can edit any employee in the department
- `documents:approve:organization` - Can approve any document in the organization

---

## Pre-Defined Permission Groups

We've created **7 common permission groups** that you can assign to employees:

### 1. **Team Lead**
- View and manage direct reports
- Approve team timesheets and leaves
- Request and approve team documents
- **Use case:** Someone who manages 2-5 direct reports

### 2. **Department Manager**
- View and manage entire department
- Approve department-level requests
- Create new employees in department
- **Use case:** Head of Engineering, HR Manager, etc.

### 3. **HR Manager**
- Full access to all employee data
- Manage onboarding and offboarding
- Access all documents
- Manage organizational structure
- **Use case:** HR department staff

### 4. **VP / Senior Leadership**
- Executive-level view access
- Approve organization-wide requests
- View all employees, documents, and structure
- **Use case:** C-level executives, VPs, Directors

### 5. **Accountant / Finance**
- View employee data (for payroll)
- Access financial documents
- View vendor and client information
- **Use case:** Finance team, payroll processors

### 6. **Document Approver**
- Approve or reject document uploads
- View all documents
- **Use case:** Compliance officer, document controller

### 7. **Recruitment / Onboarding**
- Create new employees
- Manage onboarding process
- Request documents from new hires
- **Use case:** Recruitment team, onboarding specialists

---

## Setting Up the System

### Step 1: Initialize Permission Groups

Run the SQL script to create pre-defined permission groups:

```bash
# Connect to your SQL Server database and run:
sqlcmd -S <server> -d <database> -i backend/data-init-permission-groups.sql
```

Or execute via Azure Data Studio / SQL Server Management Studio.

### Step 2: Create Organization Structure

1. Login as **Org Admin**
2. Navigate to **Organization > Departments**
3. Create departments (e.g., Engineering, HR, Finance, Sales)
4. Navigate to **Organization > Positions**
5. Create positions with seniority levels (e.g., Software Engineer (5), Senior Engineer (7), VP Engineering (10))

### Step 3: Create Employees

1. Navigate to **Employees > Add Employee**
2. Fill in employee details:
   - **Personal information** (name, email, DOB, etc.)
   - **Employment details** (department, position, joining date)
   - **Reporting structure** - Set "Reports To" field to establish hierarchy
3. Click **Create Employee**
4. Employee will receive email with password setup link

### Step 4: Assign Permission Groups

There are two ways to assign permissions:

#### Option A: Assign Permission Group (Recommended)
1. Go to **Employees > Employee Directory**
2. Click on an employee
3. Click **Assignment** tab
4. Select appropriate **Permission Groups** (e.g., "Team Lead", "HR Manager")
5. Save changes

#### Option B: Assign Custom Permissions
1. Go to **Employees > Employee Directory**
2. Click on an employee
3. Click **Permissions** tab
4. Manually select individual permissions
5. Save changes

### Step 5: Test Hierarchical Permissions

Example scenario to test:

```
Organization Structure:
- VP Engineering (Alice)
  └─ Engineering Manager (Bob)
      ├─ Senior Engineer (Charlie)
      └─ Software Engineer (Diana)
```

**Setup:**
1. Assign **VP / Senior Leadership** group to Alice
2. Assign **Department Manager** group to Bob
3. Assign **Team Lead** group to Charlie
4. Assign **Employee** role only to Diana

**Expected Access:**
- **Diana** can only view her own profile and documents
- **Charlie** can view Diana (team scope)
- **Bob** can view Charlie and Diana (department scope)
- **Alice** can view Bob, Charlie, and Diana (organization scope)

---

## Document Request Workflow

### Creating a Document Request

1. Navigate to **Document Requests > Request Document**
2. Select the employee from whom you need a document
3. Enter a message explaining what document you need
   - Example: "Please upload your Aadhaar card for KYC verification"
4. Click **Send Request**

### Fulfilling a Document Request

1. Employee receives email notification
2. Employee logs in and navigates to **Document Requests > Requests I Received**
3. Click **Upload** button on the request
4. Upload the requested document
5. Request status changes to **COMPLETED**

### Tracking Requests

- **Requests I Sent** - View status of requests you created
- **Requests I Received** - View and fulfill requests from others
- **All Document Requests** (Org Admin only) - View all requests in the organization

---

## Common Use Cases

### Use Case 1: Manager Accessing Team Data

**Scenario:** Bob (Manager) wants to view Charlie's (direct report) payroll and documents.

**Setup:**
1. Set Charlie's "Reports To" field to Bob
2. Assign Bob the **"Team Lead"** or **"Department Manager"** permission group

**Result:**
- Bob can view Charlie's profile: `employees:view:team`
- Bob can view Charlie's documents: `documents:view:team`
- Bob can request documents from Charlie: `document-requests:create:team`

### Use Case 2: HR Onboarding New Employee

**Scenario:** HR needs to onboard Diana and request her documents.

**Setup:**
1. Assign HR user the **"HR Manager"** or **"Recruitment / Onboarding"** group

**Process:**
1. HR creates Diana's employee record
2. HR navigates to **Document Requests > Request Document**
3. HR selects Diana and requests "Employment Contract", "Aadhaar Card", "PAN Card"
4. Diana receives email and uploads documents
5. HR reviews and approves documents

### Use Case 3: VP Viewing Department Performance

**Scenario:** Alice (VP) wants to view all employees in Engineering department.

**Setup:**
1. Assign Alice the **"VP / Senior Leadership"** permission group

**Result:**
- Alice can view all employees: `employees:view:organization`
- Alice can view all documents: `documents:view:organization`
- Alice can approve documents: `documents:approve:organization`

---

## Security Best Practices

1. **Principle of Least Privilege**
   - Only grant permissions users need for their job
   - Start with minimal permissions and add as needed

2. **Use Permission Groups**
   - Don't manually assign individual permissions
   - Use pre-defined groups for consistency

3. **Regular Audits**
   - Review permissions quarterly
   - Check **Access Control > Audit Logs** for suspicious activity

4. **Reporting Hierarchy**
   - Keep the "Reports To" field up-to-date
   - This determines team scope access

5. **Document Approval**
   - Assign "Document Approver" group to compliance team
   - Review uploaded documents regularly

---

## Troubleshooting

### Employee Can't See Another Employee

**Check:**
1. Does the employee have appropriate permission scope?
   - `employees:view:team` requires reporting relationship
   - `employees:view:department` requires same department
   - `employees:view:organization` is needed for all employees

2. Is the reporting structure correct?
   - Check "Reports To" field in employee profile

3. Is the employee in the right department?
   - Department scope permissions depend on department assignment

### Document Request Not Working

**Check:**
1. Does the user have `document-requests:create:{scope}` permission?
2. Is the target employee within the scope?
   - Team scope requires target to be a direct report
   - Organization scope can request from anyone

### Permission Group Not Taking Effect

**Check:**
1. Was the permission group properly assigned to the employee?
2. Refresh the page or logout/login again
3. Check if the permission exists in the group:
   - Go to **Access Control > Permission Groups**
   - View the group details

---

## API Endpoints

For developers integrating with the RBAC system:

### Check Permissions
```
GET /api/auth/permissions
Returns: List of current user's permissions
```

### Create Document Request
```
POST /api/document-requests
Body: { targetEmployeeId, message }
Requires: document-requests:create:{scope}
```

### View Employees (Scoped)
```
GET /api/employees
Returns: Only employees within user's permission scope
```

---

## Support

For issues or questions:
1. Check audit logs: **Access Control > Audit Logs**
2. Review this guide carefully
3. Contact your organization administrator
4. Report bugs via the application feedback system

---

## Summary

The HRMS RBAC system provides:
- ✅ **3 core roles** (Super Admin, Org Admin, Employee)
- ✅ **Hierarchical permissions** (own → team → department → organization)
- ✅ **7 pre-defined permission groups** for common roles
- ✅ **Fine-grained access control** (resource:action:scope)
- ✅ **Document request workflow** with email notifications
- ✅ **Complete audit trail** of all actions

This system ensures that:
- Employees only see data they're authorized to access
- Managers can view and manage their teams
- HR has necessary access for onboarding
- Executives have visibility without micromanagement
- Document requests are tracked and auditable
