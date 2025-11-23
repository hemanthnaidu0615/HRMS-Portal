# HRMS Portal Database Schema v3.0

## Overview

Production-grade database schema for a multi-tenant HR Management System supporting:
- **Multi-tenant Architecture**: Complete data isolation per organization
- **RBAC**: Flexible role-based access control
- **Country Support**: USA, UK, India, Canada, Australia, Germany
- **Full Audit Trail**: Comprehensive logging and change tracking

## Module Structure

The schema is split into 16 modules for maintainability:

| Order | Module | Description | Dependencies |
|-------|--------|-------------|--------------|
| 01 | core_foundation | Organizations, Users, Authentication | None |
| 02 | roles_permissions | RBAC System | 01 |
| 03 | org_structure | Departments, Positions, Locations | 01 |
| 04 | vendors_clients | External parties | 01, 02 |
| 05 | projects | Project management | 01, 04 |
| 06 | employees_core | Main employee entity | 01-05 |
| 07 | employee_addresses | Address management | 06 |
| 08 | employee_contacts | Emergency contacts, dependents | 06 |
| 09 | identity_documents | Country-agnostic ID management | 06 |
| 10 | employee_banking | Bank accounts for payroll | 06 |
| 11 | employee_tax | Country-specific tax info | 06 |
| 12 | onboarding | Employee onboarding workflow | 03, 06 |
| 13 | documents | Document management | 06 |
| 14 | employee_history | Change tracking | 06 |
| 15 | audit_logs | System-wide logging | 01, 02 |
| 16 | seed_data | Reference data & permissions | All |

## Installation

### Option 1: Execute modules in order
```bash
sqlcmd -S localhost -d hrms -i schema/modules/01_core_foundation.sql
sqlcmd -S localhost -d hrms -i schema/modules/02_roles_permissions.sql
# ... continue for all 16 modules
```

### Option 2: Use deployment script
```bash
cd backend/database
./deploy.sh --environment production
```

## Key Design Decisions

### 1. Multi-Tenant Isolation
Every entity has `organization_id` for complete data separation.

### 2. Soft Delete Pattern
All major entities use `deleted_at` timestamp instead of hard deletes.

### 3. Country-Agnostic Design
- Identity documents support any country via `identity_document_types`
- Tax info has country-specific columns (US W-4, UK PAYE, India TDS, etc.)
- Bank accounts support international routing (SWIFT, IBAN, IFSC, BSB, etc.)

### 4. Comprehensive Indexing
- Covering indexes for common queries
- Filtered indexes for soft-deleted records
- Composite indexes for multi-column lookups

### 5. Validation at Database Level
- CHECK constraints for enum values
- Email format validation
- Date range validation
- Foreign key cascades where appropriate

## Tables Summary

| Category | Tables | Description |
|----------|--------|-------------|
| Core | 4 | organizations, users, password_reset_tokens, organization_modules |
| RBAC | 5 | roles, permissions, role_permissions, user_roles, permission_groups |
| Structure | 4 | departments, positions, job_grades, work_locations |
| External | 2 | vendors, clients |
| Projects | 2 | projects, project_tasks |
| Employees | 10 | employees, addresses, contacts, dependents, identity docs, etc. |
| Onboarding | 4 | templates, steps, checklist items, progress |
| Documents | 4 | categories, documents, requests, acknowledgements |
| History | 5 | employee_history, notes, skills, certifications, permission_groups |
| Audit | 4 | audit_logs, email_logs, login_history, api_logs |

## Best Practices Applied

1. **Naming Conventions**: snake_case for tables/columns, descriptive names
2. **UUID Primary Keys**: For all entity tables (security, distribution-friendly)
3. **Audit Columns**: created_at, updated_at, created_by, updated_by on all tables
4. **Consistent Constraints**: Named constraints for easier maintenance
5. **Index Naming**: `idx_<table>_<column(s)>` pattern
6. **Foreign Key Naming**: `FK_<table>_<reference>` pattern

## Inspired By

- **BambooHR**: Onboarding workflow, pre-boarding packets
- **Gusto**: Tax filing automation, multi-state support
- **Workday**: Object-oriented design, business processes
- **Rippling**: 90-second onboarding, unified data platform
