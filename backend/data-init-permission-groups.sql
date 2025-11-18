-- =====================================================
-- PRE-DEFINED PERMISSION GROUPS
-- Common permission groups for typical organizational roles
-- =====================================================

-- Note: This script should be run after the schema is created
-- These are template permission groups that org admins can assign to employees

-- =====================================================
-- 1. TEAM LEAD / MANAGER
-- Can view and manage their direct reports (team scope)
-- =====================================================

-- Insert permission group
DECLARE @TeamLeadGroupId UNIQUEIDENTIFIER = NEWID();
INSERT INTO permission_groups (id, name, description) VALUES
(@TeamLeadGroupId, 'Team Lead', 'Can view and manage direct reports, approve team timesheets and leaves');

-- Assign permissions to Team Lead group
INSERT INTO group_permissions (group_id, permission_id)
SELECT @TeamLeadGroupId, id FROM permissions WHERE permission_string IN (
    -- Employee management (team scope)
    'employees:view:team',
    'employees:edit:team',

    -- Document management (team scope)
    'documents:view:team',
    'documents:upload:team',
    'documents:approve:team',
    'document-requests:create:team',
    'document-requests:view:team',

    -- Self permissions
    'employees:view:own',
    'employees:edit:own',
    'documents:view:own',
    'documents:upload:own',
    'document-requests:create:own',
    'document-requests:view:own'
);

-- =====================================================
-- 2. DEPARTMENT MANAGER
-- Can view and manage entire department (department scope)
-- =====================================================

DECLARE @DeptManagerGroupId UNIQUEIDENTIFIER = NEWID();
INSERT INTO permission_groups (id, name, description) VALUES
(@DeptManagerGroupId, 'Department Manager', 'Can view and manage all employees in their department, approve department-level requests');

INSERT INTO group_permissions (group_id, permission_id)
SELECT @DeptManagerGroupId, id FROM permissions WHERE permission_string IN (
    -- Employee management (department scope)
    'employees:view:department',
    'employees:edit:department',
    'employees:create:department',

    -- Document management (department scope)
    'documents:view:department',
    'documents:upload:department',
    'documents:approve:department',
    'document-requests:create:department',
    'document-requests:view:department',

    -- Department structure
    'departments:view:organization',
    'positions:view:organization',

    -- Also includes team scope
    'employees:view:team',
    'employees:edit:team',
    'documents:view:team',
    'documents:approve:team',

    -- Self permissions
    'employees:view:own',
    'employees:edit:own',
    'documents:view:own',
    'documents:upload:own',
    'document-requests:create:own',
    'document-requests:view:own'
);

-- =====================================================
-- 3. HR MANAGER
-- Can view all employees, manage onboarding, access all documents
-- =====================================================

DECLARE @HRManagerGroupId UNIQUEIDENTIFIER = NEWID();
INSERT INTO permission_groups (id, name, description) VALUES
(@HRManagerGroupId, 'HR Manager', 'Human Resources manager with full access to employee data, documents, and onboarding');

INSERT INTO group_permissions (group_id, permission_id)
SELECT @HRManagerGroupId, id FROM permissions WHERE permission_string IN (
    -- Full employee management (organization scope)
    'employees:view:organization',
    'employees:edit:organization',
    'employees:create:organization',
    'employees:delete:organization',

    -- Full document access
    'documents:view:organization',
    'documents:upload:organization',
    'documents:approve:organization',
    'documents:delete:organization',
    'document-requests:create:organization',
    'document-requests:view:organization',

    -- Organizational structure
    'departments:view:organization',
    'departments:create:organization',
    'departments:edit:organization',
    'positions:view:organization',
    'positions:create:organization',
    'positions:edit:organization',

    -- Vendor and client management
    'vendors:view:organization',
    'vendors:create:organization',
    'vendors:edit:organization',
    'clients:view:organization',
    'projects:view:organization',

    -- Audit logs
    'audit-logs:view:organization'
);

-- =====================================================
-- 4. VP / SENIOR LEADERSHIP
-- Executive level access to view organization-wide data
-- =====================================================

DECLARE @VPGroupId UNIQUEIDENTIFIER = NEWID();
INSERT INTO permission_groups (id, name, description) VALUES
(@VPGroupId, 'VP / Senior Leadership', 'Executive level access to view and approve organization-wide data');

INSERT INTO group_permissions (group_id, permission_id)
SELECT @VPGroupId, id FROM permissions WHERE permission_string IN (
    -- Full view access
    'employees:view:organization',
    'employees:edit:organization',
    'documents:view:organization',
    'documents:approve:organization',
    'document-requests:view:organization',

    -- Approve permissions
    'documents:approve:organization',

    -- View organizational structure
    'departments:view:organization',
    'positions:view:organization',
    'vendors:view:organization',
    'clients:view:organization',
    'projects:view:organization',

    -- Audit access
    'audit-logs:view:organization',

    -- Department and team scope also included
    'employees:view:department',
    'employees:view:team',
    'documents:view:department',
    'documents:view:team'
);

-- =====================================================
-- 5. ACCOUNTANT / FINANCE
-- Access to payroll and financial data
-- =====================================================

DECLARE @AccountantGroupId UNIQUEIDENTIFIER = NEWID();
INSERT INTO permission_groups (id, name, description) VALUES
(@AccountantGroupId, 'Accountant / Finance', 'Access to employee payroll and financial information');

INSERT INTO group_permissions (group_id, permission_id)
SELECT @AccountantGroupId, id FROM permissions WHERE permission_string IN (
    -- View employee data (for payroll purposes)
    'employees:view:organization',

    -- View documents (for tax documents, bank details)
    'documents:view:organization',
    'document-requests:create:organization',

    -- View vendors (for payment processing)
    'vendors:view:organization',
    'clients:view:organization',
    'projects:view:organization',

    -- Self permissions
    'employees:view:own',
    'documents:view:own',
    'documents:upload:own'
);

-- =====================================================
-- 6. DOCUMENT APPROVER
-- Specialized role for approving uploaded documents
-- =====================================================

DECLARE @DocApproverGroupId UNIQUEIDENTIFIER = NEWID();
INSERT INTO permission_groups (id, name, description) VALUES
(@DocApproverGroupId, 'Document Approver', 'Can approve or reject employee document uploads');

INSERT INTO group_permissions (group_id, permission_id)
SELECT @DocApproverGroupId, id FROM permissions WHERE permission_string IN (
    -- View employees (to know whose documents they're approving)
    'employees:view:organization',

    -- Document approval
    'documents:view:organization',
    'documents:approve:organization',
    'document-requests:view:organization',

    -- Self permissions
    'employees:view:own',
    'documents:view:own',
    'documents:upload:own'
);

-- =====================================================
-- 7. RECRUITMENT / ONBOARDING
-- Specialized role for hiring and onboarding new employees
-- =====================================================

DECLARE @RecruitmentGroupId UNIQUEIDENTIFIER = NEWID();
INSERT INTO permission_groups (id, name, description) VALUES
(@RecruitmentGroupId, 'Recruitment / Onboarding', 'Can create new employees and manage onboarding process');

INSERT INTO group_permissions (group_id, permission_id)
SELECT @RecruitmentGroupId, id FROM permissions WHERE permission_string IN (
    -- Create and view employees
    'employees:view:organization',
    'employees:create:organization',
    'employees:edit:organization',

    -- Document management for onboarding
    'documents:view:organization',
    'document-requests:create:organization',
    'document-requests:view:organization',

    -- View org structure
    'departments:view:organization',
    'positions:view:organization',
    'vendors:view:organization',

    -- Self permissions
    'employees:view:own',
    'documents:view:own'
);

PRINT 'Successfully created 7 pre-defined permission groups:';
PRINT '  1. Team Lead';
PRINT '  2. Department Manager';
PRINT '  3. HR Manager';
PRINT '  4. VP / Senior Leadership';
PRINT '  5. Accountant / Finance';
PRINT '  6. Document Approver';
PRINT '  7. Recruitment / Onboarding';
PRINT '';
PRINT 'Org admins can now assign these permission groups to employees.';
