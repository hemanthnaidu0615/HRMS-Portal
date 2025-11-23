-- =====================================================
-- HRMS PORTAL - MASTER SCHEMA v3.0
-- Production-Grade Multi-Tenant HR Management System
-- =====================================================
--
-- ARCHITECTURE: Multi-tenant SaaS with RBAC
-- SUPPORTED COUNTRIES: USA, UK, India, Canada, Australia, Germany
--
-- MODULE EXECUTION ORDER:
-- 01. Core Foundation    - Organizations, Users, Authentication
-- 02. Roles & Permissions - RBAC System
-- 03. Org Structure       - Departments, Positions, Locations
-- 04. Vendors & Clients   - External parties
-- 05. Projects            - Project management
-- 06. Employees Core      - Main employee entity
-- 07. Employee Addresses  - Address management
-- 08. Employee Contacts   - Emergency contacts, dependents
-- 09. Identity Documents  - Country-agnostic ID management
-- 10. Employee Banking    - Bank accounts for payroll
-- 11. Employee Tax        - Country-specific tax info
-- 12. Onboarding          - Employee onboarding workflow
-- 13. Documents           - Document management
-- 14. Employee History    - Change tracking
-- 15. Audit Logs          - System-wide logging
-- 16. Seed Data           - Reference data & permissions
--
-- INSPIRED BY: BambooHR, Gusto, Workday, Rippling
-- =====================================================

-- =====================================================
-- PRE-EXECUTION CHECKS
-- =====================================================
SET NOCOUNT ON;
SET XACT_ABORT ON;

PRINT '=====================================================';
PRINT 'HRMS PORTAL - SCHEMA INSTALLATION STARTING';
PRINT 'Version: 3.0';
PRINT 'Started at: ' + CONVERT(VARCHAR, GETDATE(), 121);
PRINT '=====================================================';

-- =====================================================
-- EXECUTE MODULES IN ORDER
-- =====================================================

-- Execute each module file in order
-- In production, these would be executed via:
-- :r modules/01_core_foundation.sql
-- :r modules/02_roles_permissions.sql
-- etc.

-- For single-file execution, the contents of each module
-- should be copied here in sequence

PRINT '';
PRINT 'To execute the complete schema:';
PRINT '1. Run modules in numerical order (01-16)';
PRINT '2. Or concatenate all modules using your deployment tool';
PRINT '';
PRINT 'Module Files:';
PRINT '  01_core_foundation.sql      - Organizations, Users';
PRINT '  02_roles_permissions.sql    - RBAC System';
PRINT '  03_org_structure.sql        - Departments, Positions';
PRINT '  04_vendors_clients.sql      - Vendors, Clients';
PRINT '  05_projects.sql             - Projects';
PRINT '  06_employees_core.sql       - Employee Entity';
PRINT '  07_employee_addresses.sql   - Addresses';
PRINT '  08_employee_contacts.sql    - Emergency Contacts';
PRINT '  09_identity_documents.sql   - ID Documents';
PRINT '  10_employee_banking.sql     - Bank Accounts';
PRINT '  11_employee_tax.sql         - Tax Information';
PRINT '  12_onboarding.sql           - Onboarding Workflow';
PRINT '  13_documents.sql            - Document Management';
PRINT '  14_employee_history.sql     - Change History';
PRINT '  15_audit_logs.sql           - Audit & Logging';
PRINT '  16_seed_data.sql            - Reference Data';
PRINT '';
PRINT '=====================================================';
PRINT 'SCHEMA INFORMATION';
PRINT '=====================================================';
PRINT 'Total Tables: 40+';
PRINT 'Total Indexes: 100+';
PRINT 'Countries Supported: 6 (USA, UK, India, Canada, Australia, Germany)';
PRINT '';
PRINT 'Key Features:';
PRINT '- Multi-tenant architecture with complete data isolation';
PRINT '- Role-based access control (RBAC)';
PRINT '- Country-agnostic identity document management';
PRINT '- Comprehensive employee onboarding workflow';
PRINT '- Full audit trail and change history';
PRINT '- Optimized indexes for common query patterns';
PRINT '=====================================================';
