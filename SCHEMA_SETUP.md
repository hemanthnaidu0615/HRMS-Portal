# HRMS Portal - Database Schema Setup Guide

## Important: Schemas Must Be Run MANUALLY

**The SQL schemas are NOT auto-run on application start.** You must execute them manually in SQL Server Management Studio (SSMS) in the exact order specified below.

---

## Prerequisites

1. SQL Server 2019 or later installed
2. SSMS connected to your SQL Server instance
3. Create a database named `hrms` (or your preferred name)

```sql
CREATE DATABASE hrms;
GO
USE hrms;
GO
```

---

## Schema Execution Order (CRITICAL)

Execute these files **in exact order** in SSMS. Each module depends on the previous ones.

| Step | File | Path | Description | Creates |
|------|------|------|-------------|---------|
| 1 | `01_core_foundation.sql` | `backend/database/schema/modules/` | Base tables | organizations, users, password_reset_tokens, organization_modules |
| 2 | `02_roles_permissions.sql` | `backend/database/schema/modules/` | RBAC system | roles, permissions, role_permissions, user_roles, permission_groups, group_permissions |
| 3 | `03_org_structure.sql` | `backend/database/schema/modules/` | Org structure | departments, positions, job_grades, work_locations |
| 4 | `04_vendors_clients.sql` | `backend/database/schema/modules/` | External parties | vendors, clients |
| 5 | `05_projects.sql` | `backend/database/schema/modules/` | Projects | projects, project_tasks |
| 6 | `06_employees_core.sql` | `backend/database/schema/modules/` | Employee base | employees, employee_code_sequences |
| 7 | `07_employee_addresses.sql` | `backend/database/schema/modules/` | Addresses | employee_addresses |
| 8 | `08_employee_contacts.sql` | `backend/database/schema/modules/` | Contacts | employee_emergency_contacts, employee_dependents |
| 9 | `09_identity_documents.sql` | `backend/database/schema/modules/` | ID documents | identity_document_types, employee_identity_documents |
| 10 | `10_employee_banking.sql` | `backend/database/schema/modules/` | Bank accounts | employee_bank_accounts |
| 11 | `11_employee_tax.sql` | `backend/database/schema/modules/` | Tax info | employee_tax_info |
| 12 | `12_onboarding.sql` | `backend/database/schema/modules/` | Onboarding | onboarding_templates, onboarding_template_steps, onboarding_checklist_items, employee_onboarding_progress, employee_onboarding_step_status |
| 13 | `13_documents.sql` | `backend/database/schema/modules/` | Documents | document_categories, documents, document_requests, document_acknowledgements |
| 14 | `14_employee_history.sql` | `backend/database/schema/modules/` | History | employee_history, employee_notes, employee_skills, employee_certifications, employee_permission_groups |
| 15 | `15_audit_logs.sql` | `backend/database/schema/modules/` | Audit | audit_logs, email_logs, login_history, api_logs |
| 16 | `16_seed_data.sql` | `backend/database/schema/modules/` | Seed data | System roles, permissions, document types |

---

## Quick Setup Script

Copy and paste this into SSMS (update the path to your project location):

```sql
-- Update this path to your project location
:setvar ProjectPath "C:\path\to\HRMS-Portal\backend\database\schema\modules"

USE hrms;
GO

:r $(ProjectPath)\01_core_foundation.sql
GO
:r $(ProjectPath)\02_roles_permissions.sql
GO
:r $(ProjectPath)\03_org_structure.sql
GO
:r $(ProjectPath)\04_vendors_clients.sql
GO
:r $(ProjectPath)\05_projects.sql
GO
:r $(ProjectPath)\06_employees_core.sql
GO
:r $(ProjectPath)\07_employee_addresses.sql
GO
:r $(ProjectPath)\08_employee_contacts.sql
GO
:r $(ProjectPath)\09_identity_documents.sql
GO
:r $(ProjectPath)\10_employee_banking.sql
GO
:r $(ProjectPath)\11_employee_tax.sql
GO
:r $(ProjectPath)\12_onboarding.sql
GO
:r $(ProjectPath)\13_documents.sql
GO
:r $(ProjectPath)\14_employee_history.sql
GO
:r $(ProjectPath)\15_audit_logs.sql
GO
:r $(ProjectPath)\16_seed_data.sql
GO

PRINT 'All schemas executed successfully!';
```

---

## Alternative: Execute One by One

If the batch script doesn't work, open each file individually in SSMS and execute (F5):

```
1. Open 01_core_foundation.sql -> Execute (F5)
2. Open 02_roles_permissions.sql -> Execute (F5)
3. Open 03_org_structure.sql -> Execute (F5)
... continue in order ...
16. Open 16_seed_data.sql -> Execute (F5)
```

---

## Verify Installation

After running all schemas, verify with:

```sql
-- Count tables (should be ~46)
SELECT COUNT(*) AS TableCount
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';

-- List all tables
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Verify seed data
SELECT * FROM roles;
SELECT COUNT(*) AS PermissionCount FROM permissions;
SELECT * FROM identity_document_types;
```

Expected results:
- ~46 tables created
- 5 system roles (superadmin, orgadmin, hr_manager, manager, employee)
- 50+ permissions
- Identity document types for 6 countries

---

## Troubleshooting

### Error: "Invalid object name"
- **Cause**: Running modules out of order
- **Fix**: Drop all tables and re-run in correct order

### Error: "Foreign key constraint failed"
- **Cause**: Missing parent table
- **Fix**: Ensure previous module was executed successfully

### Error: "Object already exists"
- **Cause**: Re-running a module
- **Fix**: Drop the existing object first or skip if already created

### Reset Database
```sql
-- WARNING: This deletes ALL data!
USE master;
GO
DROP DATABASE IF EXISTS hrms;
GO
CREATE DATABASE hrms;
GO
-- Then re-run all schemas in order
```

---

## After Schema Setup

1. Update `application.properties` with your database connection:
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=hrms;encrypt=true;trustServerCertificate=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

2. Set Hibernate to validate (not create):
```properties
spring.jpa.hibernate.ddl-auto=validate
```

3. Start the application:
```bash
cd backend
mvn spring-boot:run
```

---

## Total Tables Created (46)

| Category | Count | Tables |
|----------|-------|--------|
| Core | 4 | organizations, users, password_reset_tokens, organization_modules |
| RBAC | 6 | roles, permissions, role_permissions, user_roles, permission_groups, group_permissions |
| Structure | 4 | departments, positions, job_grades, work_locations |
| External | 2 | vendors, clients |
| Projects | 2 | projects, project_tasks |
| Employees | 2 | employees, employee_code_sequences |
| Addresses | 1 | employee_addresses |
| Contacts | 2 | employee_emergency_contacts, employee_dependents |
| Identity | 2 | identity_document_types, employee_identity_documents |
| Banking | 1 | employee_bank_accounts |
| Tax | 1 | employee_tax_info |
| Onboarding | 5 | onboarding_templates, onboarding_template_steps, onboarding_checklist_items, employee_onboarding_progress, employee_onboarding_step_status |
| Documents | 4 | document_categories, documents, document_requests, document_acknowledgements |
| History | 5 | employee_history, employee_notes, employee_skills, employee_certifications, employee_permission_groups |
| Audit | 4 | audit_logs, email_logs, login_history, api_logs |

---

*Last Updated: 2025-11-23*
