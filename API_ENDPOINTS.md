# HRMS Portal - API Endpoints Reference

## Base URL
```
http://localhost:8080
```

## Authentication
All endpoints (except `/auth/login`) require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication

### POST /auth/login
Login and get JWT token.

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@company.com",
    "firstName": "John",
    "lastName": "Admin",
    "roles": ["ORGADMIN"]
  },
  "expiresAt": "2025-11-24T12:00:00Z"
}
```

### POST /auth/set-password
Set password for new user.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "SecurePassword123!"
}
```

### POST /auth/logout
Logout current user.

---

## 2. Organizations (SuperAdmin)

### POST /api/superadmin/organizations
Create new organization.

**Request:**
```json
{
  "name": "Acme Corporation",
  "domain": "acme.com",
  "industry": "Technology",
  "size": "100-500",
  "country": "USA",
  "timezone": "America/New_York"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Acme Corporation",
  "domain": "acme.com",
  "status": "ACTIVE",
  "createdAt": "2025-11-23T10:00:00Z"
}
```

### GET /api/superadmin/organizations
List all organizations.

**Response:**
```json
{
  "content": [
    {
      "id": "...",
      "name": "Acme Corporation",
      "status": "ACTIVE",
      "employeeCount": 150
    }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

### POST /api/superadmin/organizations/{orgId}/orgadmin
Create organization admin.

**Request:**
```json
{
  "email": "hr@acme.com",
  "firstName": "Jane",
  "lastName": "HR"
}
```

---

## 3. Employees

### GET /api/organizations/{orgId}/employees
List employees with pagination and filters.

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)
- `search` (name/email/code)
- `departmentId`
- `status` (ACTIVE/INACTIVE/TERMINATED)

**Response:**
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "employeeCode": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@acme.com",
      "department": "Engineering",
      "position": "Software Engineer",
      "status": "ACTIVE",
      "joiningDate": "2024-01-15"
    }
  ],
  "totalElements": 150,
  "totalPages": 8
}
```

### POST /api/organizations/{orgId}/employees
Create new employee.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "phone": "+1-555-123-4567",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "departmentId": "dept-uuid",
  "positionId": "position-uuid",
  "joiningDate": "2025-01-15",
  "employmentType": "FULL_TIME",
  "reportingManagerId": "manager-uuid",
  "workLocationId": "location-uuid"
}
```

**Response (201):**
```json
{
  "id": "new-employee-uuid",
  "employeeCode": "EMP152",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "status": "ACTIVE"
}
```

### GET /api/organizations/{orgId}/employees/{employeeId}
Get employee details.

**Response:**
```json
{
  "id": "...",
  "employeeCode": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "phone": "+1-555-123-4567",
  "dateOfBirth": "1990-05-15",
  "department": {
    "id": "...",
    "name": "Engineering"
  },
  "position": {
    "id": "...",
    "title": "Software Engineer"
  },
  "addresses": [...],
  "emergencyContacts": [...],
  "bankAccounts": [...],
  "identityDocuments": [...]
}
```

### PUT /api/organizations/{orgId}/employees/{employeeId}
Update employee.

### DELETE /api/organizations/{orgId}/employees/{employeeId}
Soft delete employee.

---

## 4. Bulk Import

### GET /api/organizations/{orgId}/employees/import/template
Download Excel template for bulk import.

### POST /api/organizations/{orgId}/employees/import/validate
Validate import file before processing.

**Request:** `multipart/form-data` with Excel file

**Response:**
```json
{
  "valid": true,
  "totalRows": 50,
  "validRows": 48,
  "errors": [
    {"row": 12, "field": "email", "message": "Invalid email format"},
    {"row": 25, "field": "phone", "message": "Invalid phone number"}
  ]
}
```

### POST /api/organizations/{orgId}/employees/import
Process bulk import.

**Response:**
```json
{
  "imported": 48,
  "failed": 2,
  "errors": [...]
}
```

---

## 5. Employee Tax Info

### GET /api/employees/{employeeId}/tax-info
Get employee tax information.

**Response:**
```json
{
  "id": "...",
  "countryCode": "US",
  "taxIdType": "SSN",
  "taxIdNumber": "***-**-1234",
  "filingStatus": "SINGLE",
  "allowances": 2,
  "additionalWithholding": 0,
  "isVerified": true
}
```

### POST /api/employees/{employeeId}/tax-info
Create or update tax info.

**Request (US):**
```json
{
  "countryCode": "US",
  "taxIdType": "SSN",
  "taxIdNumber": "123-45-6789",
  "filingStatus": "MARRIED_FILING_JOINTLY",
  "allowances": 3
}
```

**Request (India):**
```json
{
  "countryCode": "IN",
  "taxIdType": "PAN",
  "taxIdNumber": "ABCDE1234F",
  "taxRegime": "NEW",
  "epfNumber": "MHBAN00001234567890123"
}
```

### POST /api/tax-info/{taxInfoId}/us/w4
Update US W-4 information.

**Request:**
```json
{
  "filingStatus": "MARRIED_FILING_JOINTLY",
  "multipleJobsOrSpouseWorks": false,
  "claimDependents": 2000,
  "otherIncome": 0,
  "deductions": 5000,
  "extraWithholding": 50
}
```

---

## 6. Onboarding

### POST /api/onboarding/templates
Create onboarding template.

**Request:**
```json
{
  "name": "Software Engineer Onboarding",
  "description": "Standard onboarding for engineering roles",
  "departmentId": "dept-uuid",
  "employmentType": "FULL_TIME",
  "steps": [
    {
      "name": "Complete Personal Information",
      "description": "Fill in personal details",
      "dueInDays": 1,
      "order": 1,
      "assignedTo": "EMPLOYEE"
    },
    {
      "name": "Setup Workstation",
      "description": "IT will setup laptop and accounts",
      "dueInDays": 2,
      "order": 2,
      "assignedTo": "IT_ADMIN"
    }
  ]
}
```

### POST /api/onboarding/start/{employeeId}
Start onboarding for employee.

**Request:**
```json
{
  "templateId": "template-uuid",
  "startDate": "2025-01-15"
}
```

**Response:**
```json
{
  "progressId": "progress-uuid",
  "employee": {...},
  "template": {...},
  "status": "IN_PROGRESS",
  "progress": 0,
  "steps": [...]
}
```

### PUT /api/onboarding/progress/{progressId}/steps/{stepId}
Update step status.

**Request:**
```json
{
  "status": "COMPLETED",
  "notes": "Completed all personal information"
}
```

### GET /api/onboarding/dashboard/stats
Get onboarding dashboard statistics.

**Response:**
```json
{
  "totalActive": 12,
  "completedThisMonth": 8,
  "overdueSteps": 3,
  "averageCompletionDays": 5.2,
  "byDepartment": [
    {"department": "Engineering", "active": 5, "completed": 3}
  ]
}
```

---

## 7. Documents

### POST /api/documents/upload
Upload document.

**Request:** `multipart/form-data`
- `file`: Document file
- `categoryId`: Document category UUID
- `employeeId`: Employee UUID (optional)
- `description`: Description

**Response:**
```json
{
  "id": "doc-uuid",
  "fileName": "offer_letter.pdf",
  "fileSize": 125000,
  "mimeType": "application/pdf",
  "url": "/api/documents/doc-uuid/download"
}
```

### GET /api/documents
List documents.

### POST /api/document-requests
Create document request.

**Request:**
```json
{
  "requestedFromId": "employee-uuid",
  "documentType": "ID_PROOF",
  "description": "Please upload your passport copy",
  "dueDate": "2025-01-20"
}
```

---

## 8. Organization Structure

### GET /api/organizations/{orgId}/departments
List departments.

### POST /api/organizations/{orgId}/departments
Create department.

**Request:**
```json
{
  "name": "Engineering",
  "code": "ENG",
  "parentDepartmentId": null,
  "headId": "employee-uuid"
}
```

### GET /api/organizations/{orgId}/positions
List positions.

### POST /api/organizations/{orgId}/positions
Create position.

**Request:**
```json
{
  "title": "Senior Software Engineer",
  "code": "SSE",
  "departmentId": "dept-uuid",
  "gradeId": "grade-uuid",
  "minSalary": 80000,
  "maxSalary": 120000
}
```

---

## 9. Roles & Permissions

### GET /api/roles
List roles.

**Response:**
```json
[
  {
    "id": "...",
    "name": "hr_manager",
    "displayName": "HR Manager",
    "permissions": ["employee:read", "employee:write", "leave:approve"]
  }
]
```

### POST /api/roles
Create custom role.

**Request:**
```json
{
  "name": "team_lead",
  "displayName": "Team Lead",
  "permissions": ["employee:read", "leave:approve", "attendance:read"]
}
```

### GET /api/permissions
List all available permissions.

---

## 10. Dashboard

### GET /api/dashboard/admin
Admin dashboard data.

**Response:**
```json
{
  "totalEmployees": 150,
  "activeEmployees": 145,
  "newHiresThisMonth": 5,
  "pendingApprovals": {
    "leave": 8,
    "expense": 3,
    "documents": 2
  },
  "departmentDistribution": [...],
  "recentActivity": [...]
}
```

### GET /api/dashboard/employee
Employee dashboard data.

**Response:**
```json
{
  "profile": {...},
  "leaveBalance": {...},
  "upcomingHolidays": [...],
  "pendingTasks": [...],
  "recentPayslips": [...]
}
```

---

## 11. Attendance Module

### POST /api/attendance/check-in
Employee check-in.

**Request:**
```json
{
  "employeeId": "employee-uuid",
  "checkInTime": "2025-11-23T09:00:00Z",
  "location": "Office"
}
```

### POST /api/attendance/check-out
Employee check-out.

### GET /api/attendance/records
Get attendance records.

**Query Parameters:**
- `employeeId`
- `startDate`
- `endDate`

---

## 12. Leave Module

### POST /api/leave/applications
Apply for leave.

**Request:**
```json
{
  "leaveTypeId": "leave-type-uuid",
  "startDate": "2025-12-20",
  "endDate": "2025-12-25",
  "reason": "Annual vacation"
}
```

### GET /api/leave/balance/{employeeId}
Get leave balance.

**Response:**
```json
{
  "balances": [
    {"type": "Annual Leave", "total": 20, "used": 5, "remaining": 15},
    {"type": "Sick Leave", "total": 10, "used": 2, "remaining": 8}
  ]
}
```

### PUT /api/leave/applications/{id}/approve
Approve leave application.

### PUT /api/leave/applications/{id}/reject
Reject leave application.

---

## Error Responses

All errors follow this format:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {"field": "email", "message": "Invalid email format"},
    {"field": "phone", "message": "Phone number is required"}
  ],
  "timestamp": "2025-11-23T10:00:00Z",
  "path": "/api/employees"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal Server Error |

---

## Pagination

All list endpoints support pagination:

**Request:**
```
GET /api/employees?page=0&size=20&sort=lastName,asc
```

**Response:**
```json
{
  "content": [...],
  "totalElements": 150,
  "totalPages": 8,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false
}
```

---

*Last Updated: 2025-11-23*
