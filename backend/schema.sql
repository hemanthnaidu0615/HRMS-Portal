-- =====================================================
-- HRMS PORTAL - COMPLETE DATABASE SCHEMA
-- Multi-tenant SaaS with flexible role-based permissions
-- COMPLETELY REDESIGNED FOR PRODUCTION READINESS
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

CREATE TABLE organizations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL,

    -- Business Details
    industry VARCHAR(100),
    organization_size VARCHAR(50),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),

    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'USA',
    postal_code VARCHAR(20),

    -- Configuration
    timezone VARCHAR(100) DEFAULT 'UTC',
    default_currency VARCHAR(10) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    fiscal_year_start_month INT DEFAULT 1,

    -- Subscription
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'trial',
    subscription_start_date DATE,
    subscription_end_date DATE,
    max_employees INT,

    -- Status
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL
);

CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    organization_id UNIQUEIDENTIFIER NULL,
    must_change_password BIT NOT NULL DEFAULT 1,
    is_active BIT DEFAULT 1,
    last_login_at DATETIME2,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE password_reset_tokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    used_at DATETIME2,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- FLEXIBLE ROLE & PERMISSION SYSTEM
-- =====================================================

CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization_id UNIQUEIDENTIFIER NULL,
    is_system_role BIT NOT NULL DEFAULT 0,
    description VARCHAR(500) NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT unique_role_per_org UNIQUE (name, organization_id)
);

CREATE TABLE permissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    scope VARCHAR(50) NOT NULL,
    organization_id UNIQUEIDENTIFIER NULL,
    description VARCHAR(500) NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT unique_permission UNIQUE (resource, action, scope, organization_id)
);

CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE user_roles (
    user_id UNIQUEIDENTIFIER NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE permission_groups (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500) NULL
);

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
    code VARCHAR(20),
    description VARCHAR(500),
    head_employee_id UNIQUEIDENTIFIER,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE positions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20),
    description VARCHAR(500),
    seniority_level INT NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- =====================================================
-- VENDOR & CLIENT MANAGEMENT
-- =====================================================

CREATE TABLE vendors (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    vendor_type VARCHAR(50) NOT NULL DEFAULT 'staffing',

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
    contract_status VARCHAR(50) DEFAULT 'active',

    -- Billing
    billing_type VARCHAR(50),
    default_billing_rate DECIMAL(10,2),
    billing_currency VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100),

    -- Multi-tier Support
    parent_vendor_id UNIQUEIDENTIFIER NULL,
    tier_level INT DEFAULT 1,

    -- Metrics
    total_resources_supplied INT DEFAULT 0,
    active_resources_count INT DEFAULT 0,

    -- Status
    is_active BIT DEFAULT 1,
    is_preferred BIT DEFAULT 0,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (parent_vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE clients (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Client Information
    name VARCHAR(255) NOT NULL,
    client_code VARCHAR(50) UNIQUE NOT NULL,
    client_type VARCHAR(50) DEFAULT 'corporate',
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

    -- Relationship
    relationship_start_date DATE,
    relationship_status VARCHAR(50) DEFAULT 'active',
    account_manager_id UNIQUEIDENTIFIER,

    -- Metrics
    total_active_projects INT DEFAULT 0,
    total_active_resources INT DEFAULT 0,

    -- Status
    is_active BIT DEFAULT 1,
    is_strategic BIT DEFAULT 0,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

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
    project_status VARCHAR(50) DEFAULT 'active',

    -- Financial
    project_budget DECIMAL(15,2),
    billing_rate_type VARCHAR(50),
    default_billing_rate DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',

    -- Management
    project_manager_id UNIQUEIDENTIFIER,

    -- Metrics
    total_allocated_resources INT DEFAULT 0,

    -- Status
    is_billable BIT DEFAULT 1,
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- EMPLOYEE MANAGEMENT - COMPLETE PROFESSIONAL SCHEMA
-- =====================================================

CREATE TABLE employees (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    department_id UNIQUEIDENTIFIER NULL,
    position_id UNIQUEIDENTIFIER NULL,
    reports_to UNIQUEIDENTIFIER NULL,

    -- Employee Identification
    employee_code VARCHAR(50) UNIQUE NOT NULL,

    -- Personal Details
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    marital_status VARCHAR(20),
    blood_group VARCHAR(10),

    -- Contact Information
    personal_email VARCHAR(255),
    phone_number VARCHAR(50),
    work_phone VARCHAR(50),
    alternate_phone VARCHAR(50),

    -- Current Address
    current_address_line1 VARCHAR(255),
    current_address_line2 VARCHAR(255),
    current_city VARCHAR(100),
    current_state VARCHAR(100),
    current_country VARCHAR(100),
    current_postal_code VARCHAR(20),

    -- Permanent Address
    permanent_address_line1 VARCHAR(255),
    permanent_address_line2 VARCHAR(255),
    permanent_city VARCHAR(100),
    permanent_state VARCHAR(100),
    permanent_country VARCHAR(100),
    permanent_postal_code VARCHAR(20),
    same_as_current_address BIT DEFAULT 0,

    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_email VARCHAR(255),
    alternate_emergency_contact_name VARCHAR(255),
    alternate_emergency_contact_phone VARCHAR(50),

    -- Employment Details
    joining_date DATE NOT NULL,
    confirmation_date DATE,
    original_hire_date DATE,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'internal',
    employment_status VARCHAR(50) NOT NULL DEFAULT 'active',
    work_location VARCHAR(255),
    designation VARCHAR(255),
    grade VARCHAR(50),
    level VARCHAR(50),
    notice_period_days INT DEFAULT 30,

    -- Vendor/Client Assignment
    vendor_id UNIQUEIDENTIFIER NULL,
    client_id UNIQUEIDENTIFIER NULL,
    project_id UNIQUEIDENTIFIER NULL,
    contract_end_date DATE,

    -- Probation Period
    is_probation BIT DEFAULT 0,
    probation_start_date DATE,
    probation_end_date DATE,
    probation_status VARCHAR(20),

    -- Compensation (Basic - detailed in payroll module)
    basic_salary DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    pay_frequency VARCHAR(20) DEFAULT 'monthly',
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    last_salary_review_date DATE,
    next_salary_review_date DATE,

    -- Bank Details (ENCRYPTED IN PRODUCTION)
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_account_holder_name VARCHAR(255),
    bank_ifsc_code VARCHAR(50),
    bank_swift_code VARCHAR(50),
    bank_branch VARCHAR(255),

    -- Tax & Legal Documents
    tax_id VARCHAR(50),
    tax_filing_status VARCHAR(50),
    ssn_last_four VARCHAR(4),
    passport_number VARCHAR(50),
    passport_expiry_date DATE,
    passport_issuing_country VARCHAR(100),
    visa_type VARCHAR(50),
    visa_expiry_date DATE,
    work_permit_number VARCHAR(50),
    work_permit_expiry_date DATE,

    -- Country-Specific (India)
    pan_number VARCHAR(50),
    aadhar_number_last_four VARCHAR(4),
    uan_number VARCHAR(50),

    -- Country-Specific (USA)
    drivers_license_number VARCHAR(50),
    drivers_license_state VARCHAR(50),
    drivers_license_expiry DATE,

    -- Termination/Resignation
    resignation_date DATE,
    resignation_accepted_date DATE,
    last_working_date DATE,
    exit_interview_completed BIT DEFAULT 0,
    exit_reason VARCHAR(50),
    exit_notes VARCHAR(2000),
    rehire_eligible BIT DEFAULT 1,
    notice_period_served BIT,

    -- Additional Information
    profile_photo_url VARCHAR(500),
    linkedin_profile VARCHAR(255),
    skills VARCHAR(1000),
    certifications VARCHAR(1000),
    languages_known VARCHAR(500),
    hobbies VARCHAR(500),
    notes VARCHAR(2000),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (position_id) REFERENCES positions(id),
    FOREIGN KEY (reports_to) REFERENCES employees(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),

    -- Constraints
    CONSTRAINT chk_employment_type CHECK (employment_type IN ('internal', 'contract', 'client', 'consultant', 'intern')),
    CONSTRAINT chk_employment_status CHECK (employment_status IN ('active', 'on_notice', 'resigned', 'terminated', 'suspended', 'on_leave')),
    CONSTRAINT chk_gender CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say') OR gender IS NULL),
    CONSTRAINT chk_marital_status CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated') OR marital_status IS NULL),
    CONSTRAINT chk_joining_date CHECK (joining_date <= GETDATE())
);

CREATE TABLE employee_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    changed_field VARCHAR(255) NOT NULL,
    old_value VARCHAR(MAX),
    new_value VARCHAR(MAX),
    changed_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    changed_by UNIQUEIDENTIFIER,
    change_reason VARCHAR(500),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

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
    file_type VARCHAR(100),
    document_type VARCHAR(100),
    document_category VARCHAR(100),
    approval_status VARCHAR(20) DEFAULT 'PENDING',
    approved_by UNIQUEIDENTIFIER,
    approved_at DATETIME2,
    rejection_reason VARCHAR(500),
    file_size BIGINT,
    expiry_date DATE,
    is_confidential BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE document_requests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    requester_id UNIQUEIDENTIFIER NOT NULL,
    target_employee_id UNIQUEIDENTIFIER NOT NULL,
    message VARCHAR(1000),
    document_type_requested VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    fulfilled_document_id UNIQUEIDENTIFIER,
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'normal',
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    completed_at DATETIME2,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (target_employee_id) REFERENCES employees(id),
    FOREIGN KEY (fulfilled_document_id) REFERENCES documents(id)
);

-- =====================================================
-- AUDIT & LOGGING
-- =====================================================

CREATE TABLE email_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    recipient_email VARCHAR(255) NOT NULL,
    email_type VARCHAR(100) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message VARCHAR(MAX),
    related_entity_id VARCHAR(255),
    related_entity_type VARCHAR(100),
    retry_count INT DEFAULT 0,
    sent_at DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE audit_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    performed_by UNIQUEIDENTIFIER,
    old_value VARCHAR(MAX),
    new_value VARCHAR(MAX),
    status VARCHAR(20) NOT NULL,
    error_message VARCHAR(MAX),
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    metadata VARCHAR(MAX),
    performed_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    organization_id UNIQUEIDENTIFIER,
    FOREIGN KEY (performed_by) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- =====================================================
-- EMPLOYEE CODE SEQUENCE (Department-based)
-- =====================================================

CREATE TABLE employee_code_sequences (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    department_id UNIQUEIDENTIFIER NULL,  -- NULL for default EMP codes
    prefix VARCHAR(20) NOT NULL,           -- IT, HR, FIN, or EMP
    current_number INT NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT unique_dept_sequence UNIQUE (organization_id, department_id)
);

-- =====================================================
-- SEED DATA - SYSTEM ROLES
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='superadmin' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('superadmin', NULL, 1, 'Platform administrator - manages organizations');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='orgadmin' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('orgadmin', NULL, 1, 'Organization administrator - full access');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='employee' AND is_system_role=1)
INSERT INTO roles (name, organization_id, is_system_role, description)
VALUES ('employee', NULL, 1, 'Basic employee - limited access');

-- =====================================================
-- SEED DATA - PERMISSIONS
-- =====================================================

-- EMPLOYEES permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('employees', 'view', 'own', NULL, 'View own employee profile'),
('employees', 'view', 'team', NULL, 'View direct reports'),
('employees', 'view', 'department', NULL, 'View department employees'),
('employees', 'view', 'organization', NULL, 'View all employees'),
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
('documents', 'view', 'organization', NULL, 'View all documents'),
('documents', 'upload', 'own', NULL, 'Upload own documents'),
('documents', 'upload', 'team', NULL, 'Upload documents for team'),
('documents', 'upload', 'organization', NULL, 'Upload any documents'),
('documents', 'delete', 'own', NULL, 'Delete own documents'),
('documents', 'delete', 'organization', NULL, 'Delete any documents'),
('documents', 'approve', 'organization', NULL, 'Approve/reject documents');

-- DOCUMENT REQUESTS permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('document-requests', 'create', 'team', NULL, 'Request documents from team'),
('document-requests', 'create', 'organization', NULL, 'Request from anyone'),
('document-requests', 'view', 'own', NULL, 'View own requests'),
('document-requests', 'view', 'team', NULL, 'View team requests'),
('document-requests', 'view', 'organization', NULL, 'View all requests');

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

-- VENDORS permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('vendors', 'view', 'organization', NULL, 'View all vendors'),
('vendors', 'create', 'organization', NULL, 'Create vendors'),
('vendors', 'edit', 'organization', NULL, 'Edit vendors'),
('vendors', 'delete', 'organization', NULL, 'Delete vendors');

-- CLIENTS permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('clients', 'view', 'organization', NULL, 'View all clients'),
('clients', 'create', 'organization', NULL, 'Create clients'),
('clients', 'edit', 'organization', NULL, 'Edit clients'),
('clients', 'delete', 'organization', NULL, 'Delete clients');

-- PROJECTS permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('projects', 'view', 'organization', NULL, 'View all projects'),
('projects', 'create', 'organization', NULL, 'Create projects'),
('projects', 'edit', 'organization', NULL, 'Edit projects'),
('projects', 'delete', 'organization', NULL, 'Delete projects');

-- ROLES & PERMISSIONS management
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('roles', 'view', 'organization', NULL, 'View roles'),
('roles', 'create', 'organization', NULL, 'Create roles'),
('roles', 'edit', 'organization', NULL, 'Edit roles'),
('roles', 'delete', 'organization', NULL, 'Delete roles'),
('permissions', 'view', 'organization', NULL, 'View permissions'),
('permissions', 'grant', 'organization', NULL, 'Grant permissions'),
('permissions', 'revoke', 'organization', NULL, 'Revoke permissions');

-- ORGANIZATION management
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('organization', 'view', 'organization', NULL, 'View organization'),
('organization', 'edit', 'organization', NULL, 'Edit organization');

-- AUDIT & LOGS
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('audit-logs', 'view', 'organization', NULL, 'View audit logs'),
('email-logs', 'view', 'organization', NULL, 'View email logs');

-- =====================================================
-- ASSIGN PERMISSIONS TO SYSTEM ROLES
-- =====================================================

DECLARE @SuperAdminRoleId INT = (SELECT id FROM roles WHERE name='superadmin' AND is_system_role=1);
DECLARE @OrgAdminRoleId INT = (SELECT id FROM roles WHERE name='orgadmin' AND is_system_role=1);
DECLARE @EmployeeRoleId INT = (SELECT id FROM roles WHERE name='employee' AND is_system_role=1);

-- OrgAdmin: Full organization access
INSERT INTO role_permissions (role_id, permission_id)
SELECT @OrgAdminRoleId, id FROM permissions
WHERE scope = 'organization' AND organization_id IS NULL;

-- Employee: Basic own access
INSERT INTO role_permissions (role_id, permission_id)
SELECT @EmployeeRoleId, id FROM permissions
WHERE scope = 'own' AND organization_id IS NULL;

-- =====================================================
-- PERMISSION GROUPS
-- =====================================================

INSERT INTO permission_groups (name, description) VALUES
('Employee Management', 'Manage employee data and profiles'),
('Document Management', 'Manage documents and requests'),
('Organization Structure', 'Manage departments and positions'),
('Vendor Management', 'Manage vendors, clients, and projects'),
('Access Control', 'Manage users, roles, and permissions'),
('Audit & Logs', 'View audit trails and logs');

-- Assign permissions to groups
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM permission_groups g, permissions p
WHERE g.name = 'Employee Management' AND p.resource = 'employees';

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM permission_groups g, permissions p
WHERE g.name = 'Document Management' AND p.resource IN ('documents', 'document-requests');

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM permission_groups g, permissions p
WHERE g.name = 'Organization Structure' AND p.resource IN ('departments', 'positions');

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM permission_groups g, permissions p
WHERE g.name = 'Vendor Management' AND p.resource IN ('vendors', 'clients', 'projects');

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM permission_groups g, permissions p
WHERE g.name = 'Access Control' AND p.resource IN ('roles', 'permissions');

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM permission_groups g, permissions p
WHERE g.name = 'Audit & Logs' AND p.resource IN ('audit-logs', 'email-logs');

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_status ON vendors(is_active);
CREATE INDEX idx_vendors_code ON vendors(vendor_code);

CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_clients_status ON clients(is_active);
CREATE INDEX idx_clients_code ON clients(client_code);

CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(is_active);
CREATE INDEX idx_projects_code ON projects(project_code);

CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_employees_dept ON employees(department_id);
CREATE INDEX idx_employees_reports_to ON employees(reports_to);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_joining_date ON employees(joining_date DESC);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_vendor ON employees(vendor_id);
CREATE INDEX idx_employees_client ON employees(client_id);
CREATE INDEX idx_employees_project ON employees(project_id);

CREATE INDEX idx_departments_org ON departments(organization_id);
CREATE INDEX idx_departments_code ON departments(code);

CREATE INDEX idx_positions_org ON positions(organization_id);
CREATE INDEX idx_positions_code ON positions(code);

CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_status ON documents(approval_status);
CREATE INDEX idx_documents_created ON documents(created_at DESC);

CREATE INDEX idx_document_requests_employee ON document_requests(target_employee_id);
CREATE INDEX idx_document_requests_requester ON document_requests(requester_id);
CREATE INDEX idx_document_requests_status ON document_requests(status);

CREATE INDEX idx_permissions_resource ON permissions(resource, action, scope);
CREATE INDEX idx_roles_org ON roles(organization_id);

CREATE INDEX idx_employee_history_employee ON employee_history(employee_id);
CREATE INDEX idx_employee_history_date ON employee_history(changed_at DESC);

CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at DESC);
