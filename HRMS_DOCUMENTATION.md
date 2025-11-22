# HRMS Portal - Comprehensive Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Core Modules](#core-modules)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Frontend Architecture](#frontend-architecture)
8. [Key Features](#key-features)

---

## Overview

HRMS Portal is a multi-tenant, enterprise-grade Human Resource Management System built with:
- **Backend**: Spring Boot 3.2 (Java 21)
- **Frontend**: React 18 with TypeScript & Ant Design
- **Database**: Microsoft SQL Server
- **Authentication**: JWT-based with role-based access control

### Key Differentiators
- **Country-Agnostic Design**: Supports USA, UK, India, Canada, Australia tax systems out of the box
- **Multi-Tenant Architecture**: Complete data isolation per organization
- **Comprehensive Entity Relationships**: Proper @OneToMany relationships for addresses, bank accounts, tax info
- **Bulk Operations**: CSV import with validation and detailed error reporting
- **Real-time Dashboards**: Live metrics from actual database queries

---

## Architecture

### Backend Structure
```
backend/src/main/java/com/hrms/
├── config/          # Security, CORS, JWT configuration
├── controller/      # REST API endpoints
├── dto/             # Request/Response DTOs with validation
│   └── employee/    # Employee-specific DTOs
├── entity/          # JPA entities
│   └── employee/    # Employee sub-entities (Address, Bank, Tax)
├── repository/      # Spring Data JPA repositories
├── service/         # Business logic layer
└── exception/       # Custom exceptions
```

### Frontend Structure
```
frontend/src/
├── api/             # API client functions
├── components/      # Reusable UI components
├── context/         # React context providers
├── pages/           # Route-based page components
│   ├── admin/       # ORGADMIN pages
│   ├── employee/    # Employee pages
│   └── superadmin/  # SUPERADMIN pages
└── theme/           # Styling and themes
```

---

## User Roles & Permissions

### SUPERADMIN
- Manage all organizations (CRUD)
- Create organization administrators
- View global statistics
- Access all organizations' data

### ORGADMIN (Organization Admin)
- Manage employees within organization
- View organization dashboard & metrics
- Approve documents and requests
- Configure departments and positions
- Bulk import employees

### EMPLOYEE
- View own profile and documents
- Submit document requests
- Complete onboarding tasks
- Update tax information

---

## Core Modules

### 1. Organization Management

**Entity**: `Organization.java`
**Location**: `backend/src/main/java/com/hrms/entity/Organization.java`

Fields include:
- Business Details: industry, organizationSize, registrationNumber, taxId
- Contact: email, phone, website
- Address: addressLine1/2, city, state, country, countryCode, postalCode
- Configuration: timezone, defaultCurrency, dateFormat, fiscalYearStartMonth
- Subscription: plan, status, startDate, endDate, maxEmployees

**API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/superadmin/organizations` | Create organization |
| GET | `/api/superadmin/organizations` | List all with metrics |
| GET | `/api/superadmin/organizations/{id}` | Get by ID |
| PUT | `/api/superadmin/organizations/{id}` | Update organization |
| DELETE | `/api/superadmin/organizations/{id}` | Soft delete |

### 2. Employee Management

**Entity**: `Employee.java`
**Location**: `backend/src/main/java/com/hrms/entity/Employee.java`

Key Relationships:
```java
@OneToMany(mappedBy = "employee")
List<EmployeeAddress> addresses;

@OneToMany(mappedBy = "employee")
List<EmployeeBankAccount> bankAccounts;

@OneToMany(mappedBy = "employee")
List<EmployeeEmergencyContact> emergencyContacts;

@OneToMany(mappedBy = "employee")
List<EmployeeIdentityDocument> identityDocuments;

@OneToMany(mappedBy = "employee")
List<EmployeeTaxInfo> taxInfoRecords;
```

**API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List employees (org-scoped) |
| GET | `/api/employees/{id}` | Get employee details |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/{id}` | Update employee |

### 3. Employee Tax Information

**Entity**: `EmployeeTaxInfo.java`
**Location**: `backend/src/main/java/com/hrms/entity/employee/EmployeeTaxInfo.java`

Supports country-specific tax fields:

**USA**:
- usFilingStatus (single, married_filing_jointly, etc.)
- usAllowances
- usAdditionalWithholding
- usW4Submitted, usW4SubmittedDate
- usStateCode, usStateFilingStatus

**UK**:
- ukTaxCode (e.g., 1257L)
- ukIsCumulative
- ukStudentLoanPlan (Plan1, Plan2, Plan4, Postgraduate)

**India**:
- indTaxRegime (old_regime, new_regime)
- indSection80cDeclared, indSection80dDeclared
- indTotalInvestmentDeclaration

**Canada**:
- canProvinceCode
- canTd1FederalSubmitted, canTd1ProvincialSubmitted
- canTotalClaimAmount

**Australia**:
- ausTaxFreeThreshold
- ausHelpDebt, ausSfssDebt

**API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees/{id}/tax-info` | Get all tax records |
| POST | `/api/employees/{id}/tax-info` | Create/update tax info |
| POST | `/api/tax-info/{id}/us/w4` | Submit W-4 (US) |
| POST | `/api/tax-info/{id}/india/declaration` | Submit declaration (India) |
| POST | `/api/tax-info/{id}/verify` | Verify tax record |

### 4. Bulk Employee Import

**Service**: `BulkEmployeeImportService.java`
**Location**: `backend/src/main/java/com/hrms/service/BulkEmployeeImportService.java`

Features:
- CSV parsing with OpenCSV
- Field validation with Jakarta Bean Validation
- Duplicate detection (by email and employee code)
- Department/Position/Manager resolution by code
- Automatic user account creation
- Detailed error reporting per row

**API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/organizations/{id}/employees/import` | Upload CSV |
| GET | `/api/organizations/{id}/employees/import/template` | Download template |
| GET | `/api/organizations/{id}/employees/import/instructions` | Get instructions |

**CSV Template Fields**:
```
employee_code, first_name, last_name, email, middle_name, preferred_name,
date_of_birth, gender, marital_status, nationality, phone_number,
personal_email, department_code, position_code, designation,
employment_type, employment_status, hire_date, start_date,
probation_end_date, reports_to_code, salary, pay_frequency, currency,
address_line1, address_line2, city, state, country, country_code,
postal_code, work_location, work_mode
```

### 5. Dashboard & Analytics

**Service**: `DashboardService.java`
**Controller**: `DashboardController.java`

**Admin Dashboard Stats**:
- totalEmployees, activeEmployees, onProbation
- departmentDistribution (Map<String, Long>)
- employmentTypeDistribution (Map<String, Long>)
- documentStats (total, pending, approved)
- newEmployeesLast30Days, newDocumentsLast30Days

**API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/admin` | Admin dashboard stats |
| GET | `/api/dashboard/employee` | Employee dashboard |
| GET | `/api/dashboard/superadmin` | Global stats |

---

## API Reference

### Authentication

All endpoints require JWT authentication except `/api/auth/**`.

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Response Format

**Success**:
```json
{
  "id": "uuid",
  "field": "value",
  ...
}
```

**Error**:
```json
{
  "error": "Error message",
  "details": ["field: validation error"]
}
```

### Pagination

Endpoints returning lists support:
- `page`: Page number (0-indexed)
- `size`: Page size (default 20)
- `sort`: Sort field and direction (e.g., `createdAt,desc`)

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| organizations | Multi-tenant root entity |
| users | Authentication & authorization |
| roles | SUPERADMIN, ORGADMIN, EMPLOYEE |
| employees | Employee master data |
| departments | Organization departments |
| positions | Job positions |

### Employee Sub-Tables

| Table | Description |
|-------|-------------|
| employee_addresses | Multiple addresses per employee |
| employee_bank_accounts | Bank accounts with country-specific routing |
| employee_emergency_contacts | Emergency contact persons |
| employee_identity_documents | ID documents (passport, license, etc.) |
| employee_tax_info | Country-specific tax information |

### Key Indexes

```sql
-- Employee lookups
CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_status ON employees(employment_status);

-- Tax info lookups
CREATE INDEX idx_emp_tax_employee ON employee_tax_info(employee_id);
CREATE INDEX idx_emp_tax_country ON employee_tax_info(tax_country_code);
CREATE UNIQUE INDEX idx_emp_tax_unique ON employee_tax_info(employee_id, tax_country_code, tax_year) WHERE is_current = 1;
```

---

## Frontend Architecture

### State Management
- React Context for auth state
- Local component state for forms
- API responses cached in component state

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| EnhancedAdminDashboard | pages/dashboards/ | Real-time admin metrics |
| DashboardPage | pages/admin/ | Standard admin dashboard |
| OrganizationsPage | pages/superadmin/ | Organization management |
| EmployeeManagement | pages/admin/ | Employee CRUD |

### API Integration

All API calls go through `frontend/src/api/http.ts`:
```typescript
import http from './http';

export async function getAdminDashboard() {
  const res = await http.get<AdminDashboardStats>('/api/dashboard/admin');
  return res.data;
}
```

---

## Key Features

### 1. Multi-Tenant Data Isolation
Every entity has `organization_id` foreign key ensuring complete data separation.

### 2. Soft Delete Pattern
Entities use `deleted_at` timestamp instead of hard deletes:
```java
public boolean isDeleted() {
    return deletedAt != null;
}
```

### 3. Audit Trail
- `created_at`, `updated_at` timestamps on all entities
- `AuditLog` table for tracking changes
- Configurable per organization

### 4. Country-Agnostic Design
All location and financial fields support international formats:
- Bank accounts: SWIFT, IBAN, routing numbers for USA/UK/India/Canada/Australia
- Tax info: W-4, P45, PAN, TD1 forms supported
- Addresses: International format with country codes

### 5. Validation Strategy
Three layers of validation:
1. **DTO Level**: Jakarta Bean Validation annotations
2. **Service Level**: Business rule validation
3. **Database Level**: Constraints and triggers

### 6. Error Handling
Centralized exception handling with meaningful error messages:
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
```

---

## Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- SQL Server 2019+

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables
```
# Database
SPRING_DATASOURCE_URL=jdbc:sqlserver://localhost:1433;databaseName=hrms
SPRING_DATASOURCE_USERNAME=sa
SPRING_DATASOURCE_PASSWORD=***

# JWT
JWT_SECRET=your-secret-key

# Email (optional)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
```

---

## Support

For issues and feature requests, create a GitHub issue at:
https://github.com/hemanthnaidu0615/HRMS-Portal/issues
