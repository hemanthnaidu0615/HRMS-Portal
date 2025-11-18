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

    -- Personal details
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,

    -- Employment details
    employment_type VARCHAR(50) NOT NULL DEFAULT 'internal',  -- internal, contract, client
    client_name VARCHAR(255) NULL,                            -- for client employees
    project_id VARCHAR(100) NULL,                             -- for contract/project employees
    contract_end_date DATE NULL,                              -- for contract employees

    -- Probation period tracking
    is_probation BIT NOT NULL DEFAULT 0,                      -- whether employee is on probation
    probation_start_date DATE NULL,                           -- probation start date
    probation_end_date DATE NULL,                             -- probation end date
    probation_status VARCHAR(20) NULL,                        -- active, completed, extended, terminated

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

-- Many-to-many: Employees can be assigned permission groups
CREATE TABLE employee_permission_groups (
    employee_id UNIQUEIDENTIFIER NOT NULL,
    group_id UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (employee_id, group_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES permission_groups(id) ON DELETE CASCADE
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
('employees', 'delete', 'organization', NULL, 'Delete employees'),

('employees', 'probation', 'view', NULL, 'View employee probation status'),
('employees', 'probation', 'manage', NULL, 'Manage probation periods (extend, complete, terminate)');

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

('documents', 'approve', 'organization', NULL, 'Approve/reject document submissions');

-- DOCUMENT REQUESTS permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('document-requests', 'create', 'team', NULL, 'Request documents from direct reports'),
('document-requests', 'create', 'department', NULL, 'Request documents from department members'),
('document-requests', 'create', 'organization', NULL, 'Request documents from anyone'),

('document-requests', 'view', 'own', NULL, 'View requests you created or received'),
('document-requests', 'view', 'team', NULL, 'View team document requests'),
('document-requests', 'view', 'department', NULL, 'View department document requests'),
('document-requests', 'view', 'organization', NULL, 'View all document requests'),

('document-requests', 'approve', 'team', NULL, 'Approve/reject team document requests'),
('document-requests', 'approve', 'department', NULL, 'Approve/reject department document requests'),
('document-requests', 'approve', 'organization', NULL, 'Approve/reject any document requests');

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
('roles', 'assign', 'organization', NULL, 'Assign roles to users');

-- PERMISSIONS management
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('permissions', 'view', 'organization', NULL, 'View all permissions'),
('permissions', 'grant', 'organization', NULL, 'Grant permissions to employees'),
('permissions', 'revoke', 'organization', NULL, 'Revoke permissions from employees');

-- PERMISSION GROUPS management
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('permission-groups', 'view', 'organization', NULL, 'View permission groups'),
('permission-groups', 'assign', 'organization', NULL, 'Assign permission groups to employees'),
('permission-groups', 'revoke', 'organization', NULL, 'Revoke permission groups from employees');

-- USERS management
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('users', 'view', 'organization', NULL, 'View organization users'),
('users', 'create', 'organization', NULL, 'Create new users'),
('users', 'edit', 'organization', NULL, 'Edit user accounts'),
('users', 'delete', 'organization', NULL, 'Delete user accounts'),
('users', 'reset-password', 'organization', NULL, 'Reset user passwords');

-- ORGANIZATION management
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('organization', 'view', 'organization', NULL, 'View organization details'),
('organization', 'edit', 'organization', NULL, 'Edit organization settings');

-- AUDIT & LOGS
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('audit-logs', 'view', 'organization', NULL, 'View organization audit logs'),
('email-logs', 'view', 'organization', NULL, 'View email logs');

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

-- Employee: Basic own access (view and manage their own data)
INSERT INTO role_permissions (role_id, permission_id)
SELECT @EmployeeRoleId, id FROM permissions
WHERE scope = 'own' AND organization_id IS NULL;

-- =====================================================
-- PERMISSION GROUPS FOR UI ORGANIZATION
-- =====================================================

-- Create permission groups
INSERT INTO permission_groups (name, description) VALUES
('Employee Management', 'Permissions for managing employee data and profiles'),
('Document Management', 'Permissions for managing employee documents and document requests'),
('Organization Structure', 'Permissions for managing departments and positions'),
('Access Control', 'Permissions for managing users, roles, and permissions'),
('Organization Management', 'Permissions for managing organization settings'),
('Audit & Logs', 'Permissions for viewing audit trails and email logs'),
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
AND p.resource IN ('documents', 'document-requests');

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
AND p.resource IN ('roles', 'permissions', 'permission-groups', 'users');

-- Organization Management group
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM permission_groups g, permissions p
WHERE g.name = 'Organization Management'
AND p.resource = 'organization';

-- Audit & Logs group
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM permission_groups g, permissions p
WHERE g.name = 'Audit & Logs'
AND p.resource IN ('audit-logs', 'email-logs');

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
-- VENDOR & CLIENT MANAGEMENT TABLES
-- =====================================================

-- Vendors table: Companies that provide resources to your organization
CREATE TABLE vendors (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Vendor Information
    name VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    vendor_type VARCHAR(50) NOT NULL,  -- staffing, consulting, contractor, freelance

    -- Contact Information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),

    -- Business Details
    tax_id VARCHAR(50),
    business_registration_number VARCHAR(100),
    website VARCHAR(255),

    -- Contract Details
    contract_start_date DATE,
    contract_end_date DATE,
    contract_status VARCHAR(50) NOT NULL DEFAULT 'active',  -- active, expired, terminated, suspended
    contract_document_id UNIQUEIDENTIFIER,

    -- Billing Configuration
    billing_type VARCHAR(50) NOT NULL,  -- hourly, daily, monthly, project, fixed
    default_billing_rate DECIMAL(10,2),
    billing_currency VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100),

    -- Multi-tier Support
    parent_vendor_id UNIQUEIDENTIFIER NULL,
    tier_level INT DEFAULT 1,

    -- Performance Tracking
    performance_rating DECIMAL(3,2),
    total_resources_supplied INT DEFAULT 0,
    active_resources_count INT DEFAULT 0,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    is_preferred BIT NOT NULL DEFAULT 0,
    blacklisted BIT NOT NULL DEFAULT 0,
    blacklist_reason VARCHAR(500),

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (parent_vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Clients table: End clients where employees are placed
CREATE TABLE clients (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Client Information
    name VARCHAR(255) NOT NULL,
    client_code VARCHAR(50) UNIQUE NOT NULL,
    client_type VARCHAR(50) NOT NULL,  -- corporate, government, nonprofit, individual
    industry VARCHAR(100),

    -- Contact Information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),

    -- Business Details
    tax_id VARCHAR(50),
    website VARCHAR(255),

    -- Relationship Details
    relationship_start_date DATE,
    relationship_status VARCHAR(50) NOT NULL DEFAULT 'active',
    account_manager_id UNIQUEIDENTIFIER,

    -- Business Metrics
    total_active_projects INT DEFAULT 0,
    total_active_resources INT DEFAULT 0,
    lifetime_revenue DECIMAL(15,2) DEFAULT 0,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    is_strategic BIT NOT NULL DEFAULT 0,

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (account_manager_id) REFERENCES employees(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Projects table: Client projects where resources are assigned
CREATE TABLE projects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    client_id UNIQUEIDENTIFIER NOT NULL,

    -- Project Information
    project_name VARCHAR(255) NOT NULL,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_type VARCHAR(50),
    description VARCHAR(2000),

    -- Timeline
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_duration_months INT,
    project_status VARCHAR(50) NOT NULL DEFAULT 'active',

    -- Financial
    project_budget DECIMAL(15,2),
    billing_rate_type VARCHAR(50),
    default_billing_rate DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',

    -- Management
    project_manager_id UNIQUEIDENTIFIER,

    -- Metrics
    total_allocated_resources INT DEFAULT 0,
    total_hours_logged DECIMAL(10,2) DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,

    -- Status
    is_billable BIT NOT NULL DEFAULT 1,

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (project_manager_id) REFERENCES employees(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Vendor assignments: Track employee-vendor-client relationships
CREATE TABLE vendor_assignments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    vendor_id UNIQUEIDENTIFIER NOT NULL,

    -- Assignment Details
    assignment_type VARCHAR(50) NOT NULL,
    assignment_start_date DATE NOT NULL,
    assignment_end_date DATE,
    assignment_status VARCHAR(50) NOT NULL DEFAULT 'active',

    -- Project/Client Assignment
    client_id UNIQUEIDENTIFIER,
    project_id UNIQUEIDENTIFIER,

    -- Financial Terms
    billing_rate DECIMAL(10,2),
    billing_rate_type VARCHAR(50),
    billing_currency VARCHAR(10) DEFAULT 'USD',
    markup_percentage DECIMAL(5,2),
    vendor_cost_rate DECIMAL(10,2),
    client_billing_rate DECIMAL(10,2),

    -- Multi-tier tracking
    source_vendor_id UNIQUEIDENTIFIER,
    vendor_chain VARCHAR(500),

    -- Performance
    performance_rating DECIMAL(3,2),
    feedback_notes VARCHAR(2000),

    -- Termination
    termination_date DATE,
    termination_reason VARCHAR(500),
    termination_initiated_by VARCHAR(50),

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (source_vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_status ON vendors(is_active, contract_status);
CREATE INDEX idx_vendors_parent ON vendors(parent_vendor_id);

CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_clients_status ON clients(is_active, relationship_status);

CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(project_status);

CREATE INDEX idx_vendor_assignments_org ON vendor_assignments(organization_id);
CREATE INDEX idx_vendor_assignments_employee ON vendor_assignments(employee_id);
CREATE INDEX idx_vendor_assignments_vendor ON vendor_assignments(vendor_id);

CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_employees_dept ON employees(department_id);
CREATE INDEX idx_employees_reports_to ON employees(reports_to);
CREATE INDEX idx_employees_user ON employees(user_id);

CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_created ON documents(created_at DESC);

CREATE INDEX idx_permissions_resource ON permissions(resource, action, scope);
CREATE INDEX idx_roles_org ON roles(organization_id);

CREATE INDEX idx_permission_groups_name ON permission_groups(name);

CREATE INDEX idx_employee_permission_groups_employee ON employee_permission_groups(employee_id);
CREATE INDEX idx_employee_permission_groups_group ON employee_permission_groups(group_id);

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
