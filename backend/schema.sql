-- =====================================================
-- HRMS PORTAL - COMPLETE DATABASE SCHEMA
-- Multi-tenant SaaS with flexible role-based permissions
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

CREATE TABLE organizations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    deleted_at DATETIME2 NULL
);

CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    organization_id UNIQUEIDENTIFIER NULL,
    must_change_password BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE password_reset_tokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- FLEXIBLE ROLE & PERMISSION SYSTEM
-- =====================================================

-- Roles can be system-level (superadmin) or org-specific (custom roles)
CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization_id UNIQUEIDENTIFIER NULL,
    is_system_role BIT NOT NULL DEFAULT 0,
    description VARCHAR(500) NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT unique_role_per_org UNIQUE (name, organization_id)
);

-- Resource:Action:Scope permission model
-- Examples: employees:view:team, leaves:approve:department, payroll:run:organization
CREATE TABLE permissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resource VARCHAR(100) NOT NULL,           -- employees, documents, leaves, timesheets, payroll
    action VARCHAR(100) NOT NULL,             -- view, edit, create, delete, approve, submit, run
    scope VARCHAR(50) NOT NULL,               -- own, team, department, organization
    organization_id UNIQUEIDENTIFIER NULL,    -- NULL = system permission, else custom org permission
    description VARCHAR(500) NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT unique_permission UNIQUE (resource, action, scope, organization_id)
);

-- Many-to-many: Roles have multiple permissions
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Many-to-many: Users have multiple roles
CREATE TABLE user_roles (
    user_id UNIQUEIDENTIFIER NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Permission groups for UI organization
CREATE TABLE permission_groups (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500) NULL
);

-- Many-to-many: Groups contain multiple permissions
CREATE TABLE group_permissions (
    group_id UNIQUEIDENTIFIER NOT NULL,
    permission_id UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (group_id, permission_id),
    FOREIGN KEY (group_id) REFERENCES permission_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- =====================================================
-- ORGANIZATION STRUCTURE
-- =====================================================

CREATE TABLE departments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE positions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    name VARCHAR(255) NOT NULL,
    seniority_level INT NOT NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE employees (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    department_id UNIQUEIDENTIFIER NULL,
    position_id UNIQUEIDENTIFIER NULL,
    reports_to UNIQUEIDENTIFIER NULL,

    -- Employment details
    employment_type VARCHAR(50) NOT NULL DEFAULT 'internal',  -- internal, contract, client
    client_name VARCHAR(255) NULL,                            -- for client employees
    project_id VARCHAR(100) NULL,                             -- for contract/project employees
    contract_end_date DATE NULL,                              -- for contract employees

    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    deleted_at DATETIME2 NULL,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (position_id) REFERENCES positions(id),
    FOREIGN KEY (reports_to) REFERENCES employees(id)
);

CREATE TABLE employee_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    changed_field VARCHAR(255) NOT NULL,
    old_value VARCHAR(MAX),
    new_value VARCHAR(MAX),
    changed_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    changed_by UNIQUEIDENTIFIER,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- =====================================================
-- DOCUMENT MANAGEMENT
-- =====================================================

CREATE TABLE documents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    uploaded_by UNIQUEIDENTIFIER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NULL,
    document_type VARCHAR(100) NULL,
    approval_status VARCHAR(20) DEFAULT 'PENDING',
    approved_by UNIQUEIDENTIFIER NULL,
    approved_at DATETIME2 NULL,
    rejection_reason VARCHAR(500) NULL,
    file_size BIGINT NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE document_requests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    requester_id UNIQUEIDENTIFIER NOT NULL,
    target_employee_id UNIQUEIDENTIFIER NOT NULL,
    message VARCHAR(1000) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    fulfilled_document_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    completed_at DATETIME2 NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (target_employee_id) REFERENCES employees(id),
    FOREIGN KEY (fulfilled_document_id) REFERENCES documents(id)
);

-- =====================================================
-- EMAIL AUDIT LOGGING
-- =====================================================

CREATE TABLE email_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    recipient_email VARCHAR(255) NOT NULL,
    email_type VARCHAR(100) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message VARCHAR(MAX) NULL,
    related_entity_id VARCHAR(255) NULL,
    related_entity_type VARCHAR(100) NULL,
    sent_at DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- =====================================================
-- ACTIVITY AUDIT LOGGING
-- =====================================================

CREATE TABLE audit_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NULL,
    entity_id VARCHAR(255) NULL,
    performed_by UNIQUEIDENTIFIER NULL,
    old_value VARCHAR(MAX) NULL,
    new_value VARCHAR(MAX) NULL,
    status VARCHAR(20) NOT NULL,
    error_message VARCHAR(MAX) NULL,
    ip_address VARCHAR(50) NULL,
    metadata VARCHAR(MAX) NULL,
    performed_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    organization_id UNIQUEIDENTIFIER NULL,
    FOREIGN KEY (performed_by) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- =====================================================
-- SEED DATA - SYSTEM ROLES
-- =====================================================

-- SuperAdmin role (platform administrator)
IF NOT EXISTS (SELECT 1 FROM roles WHERE name='superadmin' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('superadmin', NULL, 1, 'Platform administrator - manages organizations only');

-- Default org roles (created for each new organization)
IF NOT EXISTS (SELECT 1 FROM roles WHERE name='orgadmin' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('orgadmin', NULL, 1, 'Organization administrator - full access to organization');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='employee' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('employee', NULL, 1, 'Basic employee - limited access');

-- =====================================================
-- SEED DATA - SYSTEM PERMISSIONS
-- =====================================================

-- EMPLOYEES permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('employees', 'view', 'own', NULL, 'View own employee profile'),
('employees', 'view', 'team', NULL, 'View direct reports'),
('employees', 'view', 'department', NULL, 'View department employees'),
('employees', 'view', 'organization', NULL, 'View all employees in organization'),

('employees', 'edit', 'own', NULL, 'Edit own employee profile'),
('employees', 'edit', 'team', NULL, 'Edit direct reports'),
('employees', 'edit', 'department', NULL, 'Edit department employees'),
('employees', 'edit', 'organization', NULL, 'Edit all employees'),

('employees', 'create', 'organization', NULL, 'Create new employees'),
('employees', 'delete', 'organization', NULL, 'Delete employees');

-- DOCUMENTS permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('documents', 'view', 'own', NULL, 'View own documents'),
('documents', 'view', 'team', NULL, 'View team documents'),
('documents', 'view', 'department', NULL, 'View department documents'),
('documents', 'view', 'organization', NULL, 'View all organization documents'),

('documents', 'upload', 'own', NULL, 'Upload own documents'),
('documents', 'upload', 'team', NULL, 'Upload documents for team members'),
('documents', 'upload', 'organization', NULL, 'Upload documents for any employee'),

('documents', 'delete', 'own', NULL, 'Delete own documents'),
('documents', 'delete', 'organization', NULL, 'Delete any documents'),

('documents', 'request', 'organization', NULL, 'Request documents from others');

-- DEPARTMENTS & POSITIONS permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('departments', 'view', 'organization', NULL, 'View all departments'),
('departments', 'create', 'organization', NULL, 'Create departments'),
('departments', 'edit', 'organization', NULL, 'Edit departments'),
('departments', 'delete', 'organization', NULL, 'Delete departments'),

('positions', 'view', 'organization', NULL, 'View all positions'),
('positions', 'create', 'organization', NULL, 'Create positions'),
('positions', 'edit', 'organization', NULL, 'Edit positions'),
('positions', 'delete', 'organization', NULL, 'Delete positions');

-- ROLES & PERMISSIONS management
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('roles', 'view', 'organization', NULL, 'View organization roles'),
('roles', 'create', 'organization', NULL, 'Create custom roles'),
('roles', 'edit', 'organization', NULL, 'Edit roles'),
('roles', 'delete', 'organization', NULL, 'Delete roles'),
('roles', 'assign', 'organization', NULL, 'Assign roles to employees');

-- FUTURE: Leave management permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('leaves', 'create', 'own', NULL, 'Request own leave'),
('leaves', 'view', 'own', NULL, 'View own leave requests'),
('leaves', 'view', 'team', NULL, 'View team leave requests'),
('leaves', 'view', 'department', NULL, 'View department leave requests'),
('leaves', 'view', 'organization', NULL, 'View all leave requests'),
('leaves', 'approve', 'team', NULL, 'Approve team leave requests'),
('leaves', 'approve', 'department', NULL, 'Approve department leave requests'),
('leaves', 'approve', 'organization', NULL, 'Approve all leave requests'),
('leaves', 'cancel', 'own', NULL, 'Cancel own leave requests');

-- FUTURE: Timesheet permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('timesheets', 'submit', 'own', NULL, 'Submit own timesheet'),
('timesheets', 'view', 'own', NULL, 'View own timesheets'),
('timesheets', 'view', 'team', NULL, 'View team timesheets'),
('timesheets', 'view', 'department', NULL, 'View department timesheets'),
('timesheets', 'view', 'organization', NULL, 'View all timesheets'),
('timesheets', 'approve', 'team', NULL, 'Approve team timesheets'),
('timesheets', 'approve', 'department', NULL, 'Approve department timesheets');

-- FUTURE: Payroll permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('payroll', 'view', 'own', NULL, 'View own payroll information'),
('payroll', 'view', 'team', NULL, 'View team payroll'),
('payroll', 'view', 'organization', NULL, 'View all payroll'),
('payroll', 'run', 'organization', NULL, 'Run payroll processing'),
('payroll', 'approve', 'organization', NULL, 'Approve payroll runs');

-- =====================================================
-- ASSIGN PERMISSIONS TO SYSTEM ROLES
-- =====================================================

-- Get role IDs (will be 1, 2, 3 due to IDENTITY)
DECLARE @SuperAdminRoleId INT = (SELECT id FROM roles WHERE name='superadmin' AND is_system_role=1);
DECLARE @OrgAdminRoleId INT = (SELECT id FROM roles WHERE name='orgadmin' AND is_system_role=1);
DECLARE @EmployeeRoleId INT = (SELECT id FROM roles WHERE name='employee' AND is_system_role=1);

-- SuperAdmin: NO permissions (only manages orgs via separate controller)

-- OrgAdmin: Full organization access
INSERT INTO role_permissions (role_id, permission_id)
SELECT @OrgAdminRoleId, id FROM permissions
WHERE scope = 'organization' AND organization_id IS NULL;

-- Employee: Basic own access
INSERT INTO role_permissions (role_id, permission_id)
SELECT @EmployeeRoleId, id FROM permissions
WHERE scope = 'own' AND organization_id IS NULL
AND resource IN ('employees', 'documents', 'leaves', 'timesheets', 'payroll');

-- Employee: Can request documents
INSERT INTO role_permissions (role_id, permission_id)
SELECT @EmployeeRoleId, id FROM permissions
WHERE resource = 'documents' AND action = 'request';

-- =====================================================
-- PERMISSION GROUPS FOR UI ORGANIZATION
-- =====================================================

-- Create permission groups
INSERT INTO permission_groups (name, description) VALUES
('Employee Management', 'Permissions for managing employee data and profiles'),
('Document Management', 'Permissions for managing employee documents'),
('Organization Structure', 'Permissions for managing departments and positions'),
('Access Control', 'Permissions for managing roles and permissions'),
('Leave Management', 'Permissions for managing leave requests and approvals'),
('Timesheet Management', 'Permissions for managing timesheets'),
('Payroll Management', 'Permissions for managing payroll');

-- Assign permissions to groups
-- Employee Management group
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM permission_groups g, permissions p
WHERE g.name = 'Employee Management'
AND p.resource = 'employees';

-- Document Management group
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM permission_groups g, permissions p
WHERE g.name = 'Document Management'
AND p.resource = 'documents';

-- Organization Structure group
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM permission_groups g, permissions p
WHERE g.name = 'Organization Structure'
AND p.resource IN ('departments', 'positions');

-- Access Control group
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM permission_groups g, permissions p
WHERE g.name = 'Access Control'
AND p.resource = 'roles';

-- Leave Management group
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM permission_groups g, permissions p
WHERE g.name = 'Leave Management'
AND p.resource = 'leaves';

-- Timesheet Management group
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM permission_groups g, permissions p
WHERE g.name = 'Timesheet Management'
AND p.resource = 'timesheets';

-- Payroll Management group
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM permission_groups g, permissions p
WHERE g.name = 'Payroll Management'
AND p.resource = 'payroll';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_employees_dept ON employees(department_id);
CREATE INDEX idx_employees_reports_to ON employees(reports_to);
CREATE INDEX idx_employees_user ON employees(user_id);

CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_created ON documents(created_at DESC);

CREATE INDEX idx_permissions_resource ON permissions(resource, action, scope);
CREATE INDEX idx_roles_org ON roles(organization_id);

CREATE INDEX idx_permission_groups_name ON permission_groups(name);

CREATE INDEX idx_employee_history_employee ON employee_history(employee_id);
CREATE INDEX idx_employee_history_date ON employee_history(changed_at DESC);

CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_related_entity ON email_logs(related_entity_id, related_entity_type);

CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at DESC);
CREATE INDEX idx_audit_logs_org_action ON audit_logs(organization_id, action_type);
