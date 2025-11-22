-- =====================================================
-- MODULE: SEED DATA
-- Order: 16 (Run last - populates reference data)
-- Description: System roles, permissions, document types
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 16 of 16
-- =====================================================

-- =====================================================
-- SYSTEM ROLES
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM roles WHERE name='superadmin' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('superadmin', NULL, 1, 'Platform administrator - manages all organizations');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='orgadmin' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('orgadmin', NULL, 1, 'Organization administrator - full org access');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='hr_manager' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('hr_manager', NULL, 1, 'HR Manager - manages employees and HR processes');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='manager' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('manager', NULL, 1, 'Manager - manages direct reports');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='employee' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('employee', NULL, 1, 'Employee - basic self-service access');

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Employee permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('employees', 'view', 'own', NULL, 'View own employee profile'),
('employees', 'view', 'team', NULL, 'View direct reports'),
('employees', 'view', 'department', NULL, 'View department employees'),
('employees', 'view', 'organization', NULL, 'View all employees'),
('employees', 'edit', 'own', NULL, 'Edit own employee profile'),
('employees', 'edit', 'team', NULL, 'Edit direct reports'),
('employees', 'edit', 'organization', NULL, 'Edit all employees'),
('employees', 'create', 'organization', NULL, 'Create new employees'),
('employees', 'delete', 'organization', NULL, 'Delete/terminate employees'),
('employees', 'import', 'organization', NULL, 'Bulk import employees'),
('employees', 'export', 'organization', NULL, 'Export employee data');

-- Document permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('documents', 'view', 'own', NULL, 'View own documents'),
('documents', 'view', 'team', NULL, 'View team documents'),
('documents', 'view', 'organization', NULL, 'View all documents'),
('documents', 'upload', 'own', NULL, 'Upload own documents'),
('documents', 'upload', 'organization', NULL, 'Upload any documents'),
('documents', 'delete', 'own', NULL, 'Delete own documents'),
('documents', 'delete', 'organization', NULL, 'Delete any documents'),
('documents', 'approve', 'organization', NULL, 'Approve/reject documents'),
('documents', 'request', 'organization', NULL, 'Request documents from employees');

-- Onboarding permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('onboarding', 'view', 'own', NULL, 'View own onboarding progress'),
('onboarding', 'view', 'team', NULL, 'View team onboarding'),
('onboarding', 'view', 'organization', NULL, 'View all onboarding'),
('onboarding', 'manage', 'organization', NULL, 'Manage onboarding templates'),
('onboarding', 'complete', 'own', NULL, 'Complete own onboarding tasks'),
('onboarding', 'assign', 'organization', NULL, 'Assign onboarding to employees');

-- Department and position permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('departments', 'view', 'organization', NULL, 'View all departments'),
('departments', 'create', 'organization', NULL, 'Create departments'),
('departments', 'edit', 'organization', NULL, 'Edit departments'),
('departments', 'delete', 'organization', NULL, 'Delete departments'),
('positions', 'view', 'organization', NULL, 'View all positions'),
('positions', 'create', 'organization', NULL, 'Create positions'),
('positions', 'edit', 'organization', NULL, 'Edit positions'),
('positions', 'delete', 'organization', NULL, 'Delete positions');

-- Dashboard permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('dashboard', 'view', 'own', NULL, 'View personal dashboard'),
('dashboard', 'view', 'team', NULL, 'View team dashboard'),
('dashboard', 'view', 'organization', NULL, 'View organization dashboard'),
('reports', 'view', 'team', NULL, 'View team reports'),
('reports', 'view', 'organization', NULL, 'View all reports'),
('reports', 'export', 'organization', NULL, 'Export reports');

-- Settings permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('settings', 'view', 'organization', NULL, 'View organization settings'),
('settings', 'edit', 'organization', NULL, 'Edit organization settings'),
('roles', 'view', 'organization', NULL, 'View roles'),
('roles', 'manage', 'organization', NULL, 'Manage roles and permissions'),
('audit_logs', 'view', 'organization', NULL, 'View audit logs');

-- =====================================================
-- ASSIGN PERMISSIONS TO ROLES
-- =====================================================
DECLARE @OrgAdminRoleId INT = (SELECT id FROM roles WHERE name='orgadmin' AND is_system_role=1);
DECLARE @HRManagerRoleId INT = (SELECT id FROM roles WHERE name='hr_manager' AND is_system_role=1);
DECLARE @ManagerRoleId INT = (SELECT id FROM roles WHERE name='manager' AND is_system_role=1);
DECLARE @EmployeeRoleId INT = (SELECT id FROM roles WHERE name='employee' AND is_system_role=1);

-- OrgAdmin: Full organization access
INSERT INTO role_permissions (role_id, permission_id)
SELECT @OrgAdminRoleId, id FROM permissions
WHERE (scope = 'organization' OR scope = 'global') AND organization_id IS NULL;

-- HR Manager: HR-related organization access
INSERT INTO role_permissions (role_id, permission_id)
SELECT @HRManagerRoleId, id FROM permissions
WHERE scope IN ('organization', 'team')
AND resource IN ('employees', 'documents', 'onboarding', 'departments', 'positions', 'dashboard', 'reports')
AND organization_id IS NULL;

-- Manager: Team access
INSERT INTO role_permissions (role_id, permission_id)
SELECT @ManagerRoleId, id FROM permissions
WHERE scope IN ('own', 'team')
AND organization_id IS NULL;

-- Employee: Own access only
INSERT INTO role_permissions (role_id, permission_id)
SELECT @EmployeeRoleId, id FROM permissions
WHERE scope = 'own' AND organization_id IS NULL;

-- =====================================================
-- IDENTITY DOCUMENT TYPES - USA
-- =====================================================
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date, description) VALUES
('SSN', 'Social Security Number', 'USA', 'United States', '^\d{3}-?\d{2}-?\d{4}$', 'XXX-XX-XXXX', 'tax_id', 1, 1, 0, 'US Social Security Number for tax purposes'),
('ITIN', 'Individual Taxpayer Identification Number', 'USA', 'United States', '^9\d{2}-?\d{2}-?\d{4}$', '9XX-XX-XXXX', 'tax_id', 1, 1, 0, 'Tax ID for non-residents'),
('DL_USA', 'Driver''s License (US)', 'USA', 'United States', NULL, 'Varies by state', 'driving', 0, 0, 1, 'State-issued driving license'),
('EAD', 'Employment Authorization Document', 'USA', 'United States', NULL, 'XXX-XXX-XXXXX', 'work_auth', 0, 0, 1, 'Work permit for non-citizens'),
('GREEN_CARD', 'Permanent Resident Card', 'USA', 'United States', NULL, 'XXX-XXX-XXXXX', 'work_auth', 0, 0, 1, 'US Green Card');

-- =====================================================
-- IDENTITY DOCUMENT TYPES - INDIA
-- =====================================================
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date, description) VALUES
('PAN', 'Permanent Account Number', 'IND', 'India', '^[A-Z]{5}[0-9]{4}[A-Z]$', 'ABCDE1234F', 'tax_id', 1, 1, 0, 'Indian Tax ID'),
('AADHAAR', 'Aadhaar Number', 'IND', 'India', '^\d{4}\s?\d{4}\s?\d{4}$', 'XXXX XXXX XXXX', 'national_id', 1, 0, 0, 'Indian National ID'),
('UAN', 'Universal Account Number (PF)', 'IND', 'India', '^\d{12}$', 'XXXXXXXXXXXX', 'tax_id', 1, 0, 0, 'Provident Fund Account'),
('DL_IND', 'Driver''s License (India)', 'IND', 'India', NULL, 'XX00 00000000000', 'driving', 0, 0, 1, 'Indian driving license'),
('VOTER_ID', 'Voter ID Card', 'IND', 'India', '^[A-Z]{3}[0-9]{7}$', 'ABC1234567', 'national_id', 0, 0, 0, 'Indian Voter ID');

-- =====================================================
-- IDENTITY DOCUMENT TYPES - UK
-- =====================================================
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date, description) VALUES
('NI_NUMBER', 'National Insurance Number', 'GBR', 'United Kingdom', '^[A-Z]{2}[0-9]{6}[A-Z]$', 'AB123456C', 'tax_id', 1, 1, 0, 'UK National Insurance Number'),
('BRP', 'Biometric Residence Permit', 'GBR', 'United Kingdom', NULL, 'XXXXXXXXX', 'work_auth', 0, 0, 1, 'UK work authorization'),
('DL_UK', 'Driver''s License (UK)', 'GBR', 'United Kingdom', NULL, 'XXXXX000000XX0XX', 'driving', 0, 0, 1, 'UK driving license');

-- =====================================================
-- IDENTITY DOCUMENT TYPES - CANADA
-- =====================================================
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date, description) VALUES
('SIN', 'Social Insurance Number', 'CAN', 'Canada', '^\d{3}-?\d{3}-?\d{3}$', 'XXX-XXX-XXX', 'tax_id', 1, 1, 0, 'Canadian SIN'),
('PR_CARD', 'Permanent Resident Card', 'CAN', 'Canada', NULL, 'XXXXXXXXX', 'work_auth', 0, 0, 1, 'Canadian PR Card');

-- =====================================================
-- IDENTITY DOCUMENT TYPES - AUSTRALIA
-- =====================================================
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date, description) VALUES
('TFN', 'Tax File Number', 'AUS', 'Australia', '^\d{8,9}$', 'XXX XXX XXX', 'tax_id', 1, 1, 0, 'Australian TFN'),
('ABN', 'Australian Business Number', 'AUS', 'Australia', '^\d{11}$', 'XX XXX XXX XXX', 'tax_id', 0, 1, 0, 'For contractors');

-- =====================================================
-- IDENTITY DOCUMENT TYPES - GERMANY
-- =====================================================
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date, description) VALUES
('STEUER_ID', 'Tax Identification Number (Steuer-ID)', 'DEU', 'Germany', '^\d{11}$', 'XXXXXXXXXXX', 'tax_id', 1, 1, 0, 'German Tax ID'),
('SOZIAL', 'Social Security Number', 'DEU', 'Germany', NULL, 'XX XXXXXX X XXX', 'tax_id', 1, 0, 0, 'German Social Security');

-- =====================================================
-- IDENTITY DOCUMENT TYPES - UNIVERSAL
-- =====================================================
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date, description) VALUES
('PASSPORT', 'Passport', NULL, NULL, NULL, 'Varies', 'passport', 0, 0, 1, 'International passport'),
('WORK_VISA', 'Work Visa', NULL, NULL, NULL, 'Varies', 'visa', 0, 0, 1, 'Work visa document'),
('WORK_PERMIT', 'Work Permit', NULL, NULL, NULL, 'Varies', 'work_auth', 0, 0, 1, 'Work authorization permit');

-- =====================================================
-- DOCUMENT CATEGORIES
-- =====================================================
INSERT INTO document_categories (category_code, category_name, description, is_system_category, requires_approval, is_confidential) VALUES
('identity', 'Identity Documents', 'Government-issued identification', 1, 1, 1),
('tax', 'Tax Documents', 'Tax forms and declarations', 1, 1, 1),
('employment', 'Employment Documents', 'Offer letters, contracts, policies', 1, 0, 0),
('education', 'Education Documents', 'Degrees, certificates, transcripts', 1, 1, 0),
('certification', 'Professional Certifications', 'Industry certifications', 1, 0, 0),
('performance', 'Performance Documents', 'Reviews, appraisals, goals', 1, 0, 1),
('personal', 'Personal Documents', 'Personal records', 1, 0, 1),
('medical', 'Medical Documents', 'Health records, insurance', 1, 1, 1),
('other', 'Other Documents', 'Miscellaneous documents', 1, 0, 0);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
PRINT '=====================================================';
PRINT 'HRMS PORTAL - SCHEMA v3.0 SEED DATA LOADED';
PRINT '=====================================================';
PRINT 'Created:';
PRINT '- 5 System Roles';
PRINT '- 50+ Permissions';
PRINT '- Role-Permission Mappings';
PRINT '- 20+ Identity Document Types (6 countries)';
PRINT '- 9 Document Categories';
PRINT '=====================================================';
