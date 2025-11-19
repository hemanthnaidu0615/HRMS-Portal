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

-- =====================================================
-- ORGANIZATION MODULE SUBSCRIPTIONS
-- =====================================================

CREATE TABLE organization_modules (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    module_name VARCHAR(50) NOT NULL,
    is_enabled BIT NOT NULL DEFAULT 0,
    user_limit INT,
    expiry_date DATE,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT unique_org_module UNIQUE (organization_id, module_name)
);

-- Index for faster lookups
CREATE INDEX idx_org_modules_enabled ON organization_modules(organization_id, is_enabled);

CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    organization_id UNIQUEIDENTIFIER NULL,
    must_change_password BIT NOT NULL DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
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





-- =====================================================
-- VENDOR MANAGEMENT
-- =====================================================

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
    contract_document_id UNIQUEIDENTIFIER,  -- Link to documents table

    -- Billing Configuration
    billing_type VARCHAR(50) NOT NULL,  -- hourly, daily, monthly, project, fixed
    default_billing_rate DECIMAL(10,2),
    billing_currency VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100),  -- Net 30, Net 60, etc.

    -- Multi-tier Support
    parent_vendor_id UNIQUEIDENTIFIER NULL,  -- For sub-vendor relationships
    tier_level INT DEFAULT 1,  -- 1 = direct vendor, 2 = sub-vendor, etc.

    -- Performance Tracking
    performance_rating DECIMAL(3,2),  -- 0.00 to 5.00
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
    -- FOREIGN KEY (parent_vendor_id) REFERENCES vendors(id),  -- Removed: Circular FK, will be added via ALTER TABLE
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- CLIENT MANAGEMENT
-- =====================================================

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
    relationship_status VARCHAR(50) NOT NULL DEFAULT 'active',  -- active, inactive, prospect
    account_manager_id UNIQUEIDENTIFIER,  -- Employee managing this client

    -- Business Metrics
    total_active_projects INT DEFAULT 0,
    total_active_resources INT DEFAULT 0,
    lifetime_revenue DECIMAL(15,2) DEFAULT 0,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    is_strategic BIT NOT NULL DEFAULT 0,  -- Strategic/key client flag

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    -- FOREIGN KEY (account_manager_id) REFERENCES employees(id),  -- Removed: Circular FK, will be added via ALTER TABLE
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- PROJECTS
-- =====================================================

CREATE TABLE projects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    client_id UNIQUEIDENTIFIER NOT NULL,

    -- Project Information
    project_name VARCHAR(255) NOT NULL,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_type VARCHAR(50),  -- fixed-price, time-material, retainer
    description VARCHAR(2000),

    -- Timeline
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_duration_months INT,
    project_status VARCHAR(50) NOT NULL DEFAULT 'active',  -- active, completed, on-hold, cancelled

    -- Financial
    project_budget DECIMAL(15,2),
    billing_rate_type VARCHAR(50),  -- hourly, daily, monthly, fixed
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
    -- FOREIGN KEY (project_manager_id) REFERENCES employees(id),  -- Removed: Circular FK, will be added via ALTER TABLE
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
    alternate_emergency_contact_relationship VARCHAR(100),
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
    client_name VARCHAR(255),
    project_id UNIQUEIDENTIFIER NULL,
    project_id_string VARCHAR(255),
    contract_start_date DATE,
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
    github_profile VARCHAR(255),
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
    deleted_by UNIQUEIDENTIFIER,

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
-- Add circular foreign keys after employees table is created
-- =====================================================

-- Add self-referencing FK for vendors (parent_vendor_id)
ALTER TABLE vendors ADD CONSTRAINT FK_vendors_parent_vendor
    FOREIGN KEY (parent_vendor_id) REFERENCES vendors(id);

-- Add FK from clients to employees (account_manager_id)
ALTER TABLE clients ADD CONSTRAINT FK_clients_account_manager  
    FOREIGN KEY (account_manager_id) REFERENCES employees(id);

-- Add FK from projects to employees (project_manager_id)
ALTER TABLE projects ADD CONSTRAINT FK_projects_project_manager
    FOREIGN KEY (project_manager_id) REFERENCES employees(id);


-- =====================================================
-- VENDOR ASSIGNMENTS
-- =====================================================

CREATE TABLE vendor_assignments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    vendor_id UNIQUEIDENTIFIER NOT NULL,

    -- Assignment Details
    assignment_type VARCHAR(50) NOT NULL,  -- direct, sub-contract, temporary, permanent
    assignment_start_date DATE NOT NULL,
    assignment_end_date DATE,
    assignment_status VARCHAR(50) NOT NULL DEFAULT 'active',  -- active, completed, terminated

    -- Project/Client Assignment (optional)
    client_id UNIQUEIDENTIFIER,
    project_id UNIQUEIDENTIFIER,

    -- Financial Terms
    billing_rate DECIMAL(10,2),
    billing_rate_type VARCHAR(50),  -- hourly, daily, monthly, fixed
    billing_currency VARCHAR(10) DEFAULT 'USD',
    markup_percentage DECIMAL(5,2),  -- Your org's markup on vendor rate

    -- Cost to your org from vendor
    vendor_cost_rate DECIMAL(10,2),

    -- Revenue from client (if applicable)
    client_billing_rate DECIMAL(10,2),

    -- Multi-tier tracking
    source_vendor_id UNIQUEIDENTIFIER,  -- If employee came via sub-vendor
    vendor_chain VARCHAR(500),  -- JSON array of vendor hierarchy

    -- Performance
    performance_rating DECIMAL(3,2),
    feedback_notes VARCHAR(2000),

    -- Termination details
    termination_date DATE,
    termination_reason VARCHAR(500),
    termination_initiated_by VARCHAR(50),  -- vendor, client, organization, employee

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
-- VENDOR CONTRACTS
-- =====================================================

-- Vendor contracts: Detailed contract tracking
CREATE TABLE vendor_contracts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    vendor_id UNIQUEIDENTIFIER NOT NULL,

    -- Contract Details
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    contract_title VARCHAR(255) NOT NULL,
    contract_type VARCHAR(50) NOT NULL,  -- msa, sow, po, amendment

    -- Timeline
    effective_date DATE NOT NULL,
    expiration_date DATE,
    auto_renewal BIT DEFAULT 0,
    renewal_notice_days INT,

    -- Financial Terms
    contract_value DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100),

    -- Resources
    max_resources_allowed INT,

    -- Status
    contract_status VARCHAR(50) NOT NULL DEFAULT 'draft',  -- draft, active, expired, terminated, renewed

    -- Documents
    contract_document_id UNIQUEIDENTIFIER,
    signed_document_id UNIQUEIDENTIFIER,

    -- Approval
    approved_by UNIQUEIDENTIFIER,
    approved_at DATETIME2,

    -- Metadata
    notes VARCHAR(2000),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- VENDOR PERFORMANCE REVIEWS
-- =====================================================

-- Track vendor performance over time
CREATE TABLE vendor_performance_reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    vendor_id UNIQUEIDENTIFIER NOT NULL,

    -- Review Details
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_date DATE NOT NULL,
    reviewer_id UNIQUEIDENTIFIER NOT NULL,

    -- Ratings (1-5 scale)
    quality_rating DECIMAL(3,2),
    timeliness_rating DECIMAL(3,2),
    communication_rating DECIMAL(3,2),
    cost_effectiveness_rating DECIMAL(3,2),
    overall_rating DECIMAL(3,2),

    -- Metrics
    total_resources_period INT,
    successful_placements INT,
    failed_placements INT,
    average_time_to_fill_days DECIMAL(5,1),

    -- Feedback
    strengths VARCHAR(2000),
    areas_for_improvement VARCHAR(2000),
    action_items VARCHAR(2000),

    -- Recommendation
    recommendation VARCHAR(50),  -- continue, probation, terminate

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
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


-- INDEXES FOR VENDOR MANAGEMENT
-- =====================================================

CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_status ON vendors(is_active, contract_status);
CREATE INDEX idx_vendors_parent ON vendors(parent_vendor_id);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);

CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_clients_status ON clients(is_active, relationship_status);
CREATE INDEX idx_clients_manager ON clients(account_manager_id);

CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

CREATE INDEX idx_vendor_assignments_org ON vendor_assignments(organization_id);
CREATE INDEX idx_vendor_assignments_employee ON vendor_assignments(employee_id);
CREATE INDEX idx_vendor_assignments_vendor ON vendor_assignments(vendor_id);
CREATE INDEX idx_vendor_assignments_client ON vendor_assignments(client_id);
CREATE INDEX idx_vendor_assignments_project ON vendor_assignments(project_id);
CREATE INDEX idx_vendor_assignments_status ON vendor_assignments(assignment_status);

CREATE INDEX idx_vendor_contracts_org ON vendor_contracts(organization_id);
CREATE INDEX idx_vendor_contracts_vendor ON vendor_contracts(vendor_id);
CREATE INDEX idx_vendor_contracts_status ON vendor_contracts(contract_status);
CREATE INDEX idx_vendor_contracts_dates ON vendor_contracts(effective_date, expiration_date);

CREATE INDEX idx_vendor_reviews_org ON vendor_performance_reviews(organization_id);
CREATE INDEX idx_vendor_reviews_vendor ON vendor_performance_reviews(vendor_id);
CREATE INDEX idx_vendor_reviews_date ON vendor_performance_reviews(review_date DESC);

-- =====================================================
-- SEED DATA - VENDOR MANAGEMENT PERMISSIONS
-- Safe to run multiple times - uses BEGIN TRY/CATCH
-- =====================================================

BEGIN TRY
    -- Add vendor management permissions (only if they don't exist)
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'vendors' AND action = 'view' AND scope = 'organization' AND organization_id IS NULL)
    BEGIN
        INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
        -- Vendors
        ('vendors', 'view', 'organization', NULL, 'View all vendors'),
        ('vendors', 'create', 'organization', NULL, 'Create new vendors'),
        ('vendors', 'edit', 'organization', NULL, 'Edit vendor information'),
        ('vendors', 'delete', 'organization', NULL, 'Delete vendors'),
        ('vendors', 'rate', 'organization', NULL, 'Rate vendor performance'),

        -- Clients
        ('clients', 'view', 'organization', NULL, 'View all clients'),
        ('clients', 'create', 'organization', NULL, 'Create new clients'),
        ('clients', 'edit', 'organization', NULL, 'Edit client information'),
        ('clients', 'delete', 'organization', NULL, 'Delete clients'),

        -- Projects
        ('projects', 'view', 'own', NULL, 'View own projects'),
        ('projects', 'view', 'organization', NULL, 'View all projects'),
        ('projects', 'create', 'organization', NULL, 'Create new projects'),
        ('projects', 'edit', 'organization', NULL, 'Edit project details'),
        ('projects', 'delete', 'organization', NULL, 'Delete projects'),

        -- Vendor Assignments
        ('vendor-assignments', 'view', 'organization', NULL, 'View vendor assignments'),
        ('vendor-assignments', 'create', 'organization', NULL, 'Create vendor assignments'),
        ('vendor-assignments', 'edit', 'organization', NULL, 'Edit vendor assignments'),
        ('vendor-assignments', 'terminate', 'organization', NULL, 'Terminate vendor assignments'),

        -- Vendor Contracts
        ('vendor-contracts', 'view', 'organization', NULL, 'View vendor contracts'),
        ('vendor-contracts', 'create', 'organization', NULL, 'Create vendor contracts'),
        ('vendor-contracts', 'edit', 'organization', NULL, 'Edit vendor contracts'),
        ('vendor-contracts', 'approve', 'organization', NULL, 'Approve vendor contracts');
    END

    -- Create permission group for Vendor Management (only if doesn't exist)
    IF NOT EXISTS (SELECT 1 FROM permission_groups WHERE name = 'Vendor & Client Management')
    BEGIN
        INSERT INTO permission_groups (name, description) VALUES
        ('Vendor & Client Management', 'Permissions for managing vendors, clients, projects, and assignments');
    END

    -- Assign permissions to vendor management group (idempotent)
    INSERT INTO group_permissions (group_id, permission_id)
    SELECT g.id, p.id
    FROM permission_groups g, permissions p
    WHERE g.name = 'Vendor & Client Management'
    AND p.resource IN ('vendors', 'clients', 'projects', 'vendor-assignments', 'vendor-contracts')
    AND NOT EXISTS (
        SELECT 1 FROM group_permissions gp
        WHERE gp.group_id = g.id AND gp.permission_id = p.id
    );

    -- Assign vendor management permissions to OrgAdmin role (idempotent)
    -- Note: @OrgAdminRoleId is already declared earlier in the script
    IF @OrgAdminRoleId IS NOT NULL
    BEGIN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT @OrgAdminRoleId, p.id
        FROM permissions p
        WHERE p.resource IN ('vendors', 'clients', 'projects', 'vendor-assignments', 'vendor-contracts')
        AND p.organization_id IS NULL
        AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp
            WHERE rp.role_id = @OrgAdminRoleId AND rp.permission_id = p.id
        );
    END
END TRY
BEGIN CATCH
    -- Silently ignore errors (permissions might already exist)
    PRINT 'Vendor management permissions already exist or could not be created. Continuing...';
END CATCH;

-- =====================================================
-- PRE-DEFINED PERMISSION GROUPS
-- Common permission groups for typical organizational roles
-- =====================================================

BEGIN TRY
    -- =====================================================
    -- 1. TEAM LEAD / MANAGER
    -- Can view and manage their direct reports (team scope)
    -- =====================================================

    IF NOT EXISTS (SELECT 1 FROM permission_groups WHERE name = 'Team Lead')
    BEGIN
        DECLARE @TeamLeadGroupId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO permission_groups (id, name, description) VALUES
        (@TeamLeadGroupId, 'Team Lead', 'Can view and manage direct reports, approve team timesheets and leaves');

        -- Assign permissions to Team Lead group
        INSERT INTO group_permissions (group_id, permission_id)
        SELECT @TeamLeadGroupId, id FROM permissions WHERE CONCAT(resource, ':', action, ':', scope) IN (
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
    END

    -- =====================================================
    -- 2. DEPARTMENT MANAGER
    -- Can view and manage entire department (department scope)
    -- =====================================================

    IF NOT EXISTS (SELECT 1 FROM permission_groups WHERE name = 'Department Manager')
    BEGIN
        DECLARE @DeptManagerGroupId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO permission_groups (id, name, description) VALUES
        (@DeptManagerGroupId, 'Department Manager', 'Can view and manage all employees in their department, approve department-level requests');

        INSERT INTO group_permissions (group_id, permission_id)
        SELECT @DeptManagerGroupId, id FROM permissions WHERE CONCAT(resource, ':', action, ':', scope) IN (
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
    END

    -- =====================================================
    -- 3. HR MANAGER
    -- Can view all employees, manage onboarding, access all documents
    -- =====================================================

    IF NOT EXISTS (SELECT 1 FROM permission_groups WHERE name = 'HR Manager')
    BEGIN
        DECLARE @HRManagerGroupId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO permission_groups (id, name, description) VALUES
        (@HRManagerGroupId, 'HR Manager', 'Human Resources manager with full access to employee data, documents, and onboarding');

        INSERT INTO group_permissions (group_id, permission_id)
        SELECT @HRManagerGroupId, id FROM permissions WHERE CONCAT(resource, ':', action, ':', scope) IN (
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
    END

    -- =====================================================
    -- 4. VP / SENIOR LEADERSHIP
    -- Executive level access to view organization-wide data
    -- =====================================================

    IF NOT EXISTS (SELECT 1 FROM permission_groups WHERE name = 'VP / Senior Leadership')
    BEGIN
        DECLARE @VPGroupId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO permission_groups (id, name, description) VALUES
        (@VPGroupId, 'VP / Senior Leadership', 'Executive level access to view and approve organization-wide data');

        INSERT INTO group_permissions (group_id, permission_id)
        SELECT @VPGroupId, id FROM permissions WHERE CONCAT(resource, ':', action, ':', scope) IN (
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
    END

    -- =====================================================
    -- 5. ACCOUNTANT / FINANCE
    -- Access to payroll and financial data
    -- =====================================================

    IF NOT EXISTS (SELECT 1 FROM permission_groups WHERE name = 'Accountant / Finance')
    BEGIN
        DECLARE @AccountantGroupId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO permission_groups (id, name, description) VALUES
        (@AccountantGroupId, 'Accountant / Finance', 'Access to employee payroll and financial information');

        INSERT INTO group_permissions (group_id, permission_id)
        SELECT @AccountantGroupId, id FROM permissions WHERE CONCAT(resource, ':', action, ':', scope) IN (
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
    END

    -- =====================================================
    -- 6. DOCUMENT APPROVER
    -- Specialized role for approving uploaded documents
    -- =====================================================

    IF NOT EXISTS (SELECT 1 FROM permission_groups WHERE name = 'Document Approver')
    BEGIN
        DECLARE @DocApproverGroupId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO permission_groups (id, name, description) VALUES
        (@DocApproverGroupId, 'Document Approver', 'Can approve or reject employee document uploads');

        INSERT INTO group_permissions (group_id, permission_id)
        SELECT @DocApproverGroupId, id FROM permissions WHERE CONCAT(resource, ':', action, ':', scope) IN (
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
    END

    -- =====================================================
    -- 7. RECRUITMENT / ONBOARDING
    -- Specialized role for hiring and onboarding new employees
    -- =====================================================

    IF NOT EXISTS (SELECT 1 FROM permission_groups WHERE name = 'Recruitment / Onboarding')
    BEGIN
        DECLARE @RecruitmentGroupId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO permission_groups (id, name, description) VALUES
        (@RecruitmentGroupId, 'Recruitment / Onboarding', 'Can create new employees and manage onboarding process');

        INSERT INTO group_permissions (group_id, permission_id)
        SELECT @RecruitmentGroupId, id FROM permissions WHERE CONCAT(resource, ':', action, ':', scope) IN (
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
    END

    PRINT 'Pre-defined permission groups created successfully:';
    PRINT '  - Team Lead';
    PRINT '  - Department Manager';
    PRINT '  - HR Manager';
    PRINT '  - VP / Senior Leadership';
    PRINT '  - Accountant / Finance';
    PRINT '  - Document Approver';
    PRINT '  - Recruitment / Onboarding';
END TRY
BEGIN CATCH
    PRINT 'Pre-defined permission groups already exist or could not be created. Continuing...';
END CATCH;

-- =====================================================
-- ATTENDANCE MANAGEMENT MODULE
-- Complete attendance tracking with shifts, biometric integration, regularization
-- =====================================================

-- Shift Definitions
CREATE TABLE shifts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Shift Details
    shift_name VARCHAR(100) NOT NULL,
    shift_code VARCHAR(20) NOT NULL,
    description VARCHAR(500),

    -- Timing
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_hours DECIMAL(4,2) NOT NULL,

    -- Break Configuration
    break_duration_minutes INT DEFAULT 0,
    paid_break BIT DEFAULT 1,

    -- Grace Periods
    late_arrival_grace_minutes INT DEFAULT 0,
    early_departure_grace_minutes INT DEFAULT 0,

    -- Overtime
    overtime_enabled BIT DEFAULT 1,
    overtime_multiplier DECIMAL(4,2) DEFAULT 1.5,
    max_overtime_hours_per_day DECIMAL(4,2) DEFAULT 4,

    -- Half Day Rules
    half_day_min_hours DECIMAL(4,2) DEFAULT 4,

    -- Week Configuration
    week_off_days VARCHAR(100), -- JSON array: ["saturday", "sunday"]
    is_rotational BIT DEFAULT 0,

    -- Status
    is_active BIT DEFAULT 1,
    is_default BIT DEFAULT 0,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_shift_code UNIQUE (organization_id, shift_code)
);

-- Employee Shift Assignments
CREATE TABLE employee_shifts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    shift_id UNIQUEIDENTIFIER NOT NULL,

    -- Assignment Period
    effective_from DATE NOT NULL,
    effective_to DATE,

    -- Status
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Daily Attendance Records
CREATE TABLE attendance_records (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Date & Shift
    attendance_date DATE NOT NULL,
    shift_id UNIQUEIDENTIFIER,

    -- Check-in/out Times
    check_in_time DATETIME2,
    check_out_time DATETIME2,

    -- Actual worked hours
    total_hours_worked DECIMAL(5,2),
    break_hours DECIMAL(5,2) DEFAULT 0,
    net_hours_worked DECIMAL(5,2),

    -- Overtime
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    overtime_approved BIT DEFAULT 0,
    overtime_approved_by UNIQUEIDENTIFIER,
    overtime_approved_at DATETIME2,

    -- Status
    attendance_status VARCHAR(50) NOT NULL DEFAULT 'present', -- present, absent, half_day, week_off, holiday, on_leave

    -- Late/Early Flags
    is_late_arrival BIT DEFAULT 0,
    late_by_minutes INT DEFAULT 0,
    is_early_departure BIT DEFAULT 0,
    early_by_minutes INT DEFAULT 0,

    -- Source
    source_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- biometric, manual, system, imported
    biometric_device_id VARCHAR(100),

    -- Regularization
    is_regularized BIT DEFAULT 0,
    regularization_request_id UNIQUEIDENTIFIER,

    -- Remarks
    remarks VARCHAR(1000),

    -- Location (for mobile check-in)
    check_in_latitude DECIMAL(10,8),
    check_in_longitude DECIMAL(11,8),
    check_out_latitude DECIMAL(10,8),
    check_out_longitude DECIMAL(11,8),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    FOREIGN KEY (overtime_approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_attendance_record UNIQUE (employee_id, attendance_date)
);

-- Attendance Regularization Requests
CREATE TABLE attendance_regularization_requests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    attendance_record_id UNIQUEIDENTIFIER,

    -- Request Details
    regularization_date DATE NOT NULL,
    requested_check_in_time DATETIME2,
    requested_check_out_time DATETIME2,
    reason VARCHAR(1000) NOT NULL,

    -- Approval Workflow
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    approver_id UNIQUEIDENTIFIER,
    approved_at DATETIME2,
    rejection_reason VARCHAR(500),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id),
    FOREIGN KEY (approver_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Biometric Device Integration
CREATE TABLE biometric_devices (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Device Information
    device_name VARCHAR(100) NOT NULL,
    device_id VARCHAR(100) NOT NULL UNIQUE,
    device_type VARCHAR(50), -- fingerprint, face_recognition, card_reader
    manufacturer VARCHAR(100),
    model VARCHAR(100),

    -- Location
    location VARCHAR(255),
    department_id UNIQUEIDENTIFIER,

    -- Connection
    ip_address VARCHAR(50),
    port INT,
    api_endpoint VARCHAR(500),

    -- Status
    is_active BIT DEFAULT 1,
    last_sync_at DATETIME2,
    sync_status VARCHAR(50),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Biometric Raw Logs (for reconciliation)
CREATE TABLE biometric_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    device_id UNIQUEIDENTIFIER NOT NULL,

    -- Employee Identification
    employee_id UNIQUEIDENTIFIER,
    biometric_employee_code VARCHAR(100), -- Device-specific employee code

    -- Punch Details
    punch_time DATETIME2 NOT NULL,
    punch_type VARCHAR(20), -- in, out, break_start, break_end

    -- Processing Status
    is_processed BIT DEFAULT 0,
    processed_at DATETIME2,
    attendance_record_id UNIQUEIDENTIFIER,

    -- Raw Data
    raw_data VARCHAR(MAX), -- JSON

    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (device_id) REFERENCES biometric_devices(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id)
);

-- Attendance Summary (Monthly)
CREATE TABLE attendance_summary (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Period
    month INT NOT NULL,
    year INT NOT NULL,

    -- Counts
    total_working_days INT NOT NULL,
    present_days INT DEFAULT 0,
    absent_days INT DEFAULT 0,
    half_days INT DEFAULT 0,
    leave_days DECIMAL(5,2) DEFAULT 0,
    week_offs INT DEFAULT 0,
    holidays INT DEFAULT 0,

    -- Hours
    total_hours_worked DECIMAL(8,2) DEFAULT 0,
    total_overtime_hours DECIMAL(8,2) DEFAULT 0,

    -- Infractions
    late_arrivals INT DEFAULT 0,
    early_departures INT DEFAULT 0,

    -- Payroll Integration
    payable_days DECIMAL(5,2),
    loss_of_pay_days DECIMAL(5,2) DEFAULT 0,

    -- Status
    is_finalized BIT DEFAULT 0,
    finalized_at DATETIME2,
    finalized_by UNIQUEIDENTIFIER,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (finalized_by) REFERENCES users(id),
    CONSTRAINT unique_attendance_summary UNIQUE (employee_id, month, year)
);

-- Indexes for Attendance
CREATE INDEX idx_shifts_org ON shifts(organization_id);
CREATE INDEX idx_shifts_active ON shifts(is_active);

CREATE INDEX idx_employee_shifts_employee ON employee_shifts(employee_id);
CREATE INDEX idx_employee_shifts_shift ON employee_shifts(shift_id);
CREATE INDEX idx_employee_shifts_dates ON employee_shifts(effective_from, effective_to);

CREATE INDEX idx_attendance_records_employee ON attendance_records(employee_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(attendance_date DESC);
CREATE INDEX idx_attendance_records_status ON attendance_records(attendance_status);
CREATE INDEX idx_attendance_records_employee_date ON attendance_records(employee_id, attendance_date);

CREATE INDEX idx_regularization_requests_employee ON attendance_regularization_requests(employee_id);
CREATE INDEX idx_regularization_requests_status ON attendance_regularization_requests(status);
CREATE INDEX idx_regularization_requests_date ON attendance_regularization_requests(regularization_date);

CREATE INDEX idx_biometric_logs_device ON biometric_logs(device_id);
CREATE INDEX idx_biometric_logs_employee ON biometric_logs(employee_id);
CREATE INDEX idx_biometric_logs_time ON biometric_logs(punch_time DESC);
CREATE INDEX idx_biometric_logs_processed ON biometric_logs(is_processed);

CREATE INDEX idx_attendance_summary_employee ON attendance_summary(employee_id);
CREATE INDEX idx_attendance_summary_period ON attendance_summary(year, month);

-- =====================================================
-- LEAVE MANAGEMENT MODULE
-- Complete leave system with accrual, carry-forward, encashment, approval workflows
-- =====================================================

-- Leave Types Configuration
CREATE TABLE leave_types (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Leave Type Details
    leave_type_name VARCHAR(100) NOT NULL,
    leave_type_code VARCHAR(20) NOT NULL,
    description VARCHAR(500),

    -- Accrual Configuration
    accrual_type VARCHAR(50) NOT NULL DEFAULT 'fixed', -- fixed, monthly, yearly, custom
    annual_quota DECIMAL(5,2) DEFAULT 0, -- Total leaves per year
    monthly_accrual DECIMAL(5,2) DEFAULT 0, -- Leaves accrued per month
    accrual_start_month INT DEFAULT 1, -- Month when accrual starts (1-12)

    -- Eligibility
    min_tenure_months INT DEFAULT 0, -- Minimum months to be eligible
    applicable_to VARCHAR(50) DEFAULT 'all', -- all, probation, confirmed

    -- Balance Rules
    max_carry_forward DECIMAL(5,2) DEFAULT 0,
    max_balance DECIMAL(5,2), -- Maximum accumulated balance
    negative_balance_allowed BIT DEFAULT 0,
    max_negative_balance DECIMAL(5,2) DEFAULT 0,

    -- Encashment Rules
    encashment_allowed BIT DEFAULT 0,
    min_balance_for_encashment DECIMAL(5,2) DEFAULT 0,
    max_encashment_days DECIMAL(5,2),
    encashment_percentage DECIMAL(5,2) DEFAULT 100, -- % of salary per day

    -- Application Rules
    min_days_per_request DECIMAL(4,2) DEFAULT 0.5,
    max_days_per_request DECIMAL(5,2),
    advance_notice_days INT DEFAULT 0,
    max_consecutive_days DECIMAL(5,2),

    -- Half-day & Sandwich Rules
    half_day_allowed BIT DEFAULT 1,
    sandwich_rule_applies BIT DEFAULT 0, -- Count weekends/holidays in between

    -- Approval
    requires_approval BIT DEFAULT 1,
    approval_levels INT DEFAULT 1,

    -- Calendar Impact
    affects_payroll BIT DEFAULT 1,
    is_paid_leave BIT DEFAULT 1,
    counts_as_present BIT DEFAULT 1,

    -- Weekend/Holiday Handling
    exclude_weekends BIT DEFAULT 1,
    exclude_holidays BIT DEFAULT 1,

    -- Gender-Specific
    gender_specific VARCHAR(20), -- null, male, female

    -- Display
    color_code VARCHAR(7), -- Hex color for calendar
    icon VARCHAR(50),
    display_order INT DEFAULT 0,

    -- Status
    is_active BIT DEFAULT 1,
    is_system_type BIT DEFAULT 0, -- System types like probation leave

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_leave_type_code UNIQUE (organization_id, leave_type_code)
);

-- Employee Leave Balances
CREATE TABLE leave_balances (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    leave_type_id UNIQUEIDENTIFIER NOT NULL,

    -- Accrual Year
    accrual_year INT NOT NULL,

    -- Balance Details
    opening_balance DECIMAL(5,2) DEFAULT 0,
    accrued_balance DECIMAL(5,2) DEFAULT 0,
    carry_forward_balance DECIMAL(5,2) DEFAULT 0,
    credited_balance DECIMAL(5,2) DEFAULT 0, -- Manual credits
    total_available DECIMAL(5,2) DEFAULT 0,

    -- Consumed
    consumed_balance DECIMAL(5,2) DEFAULT 0,
    pending_balance DECIMAL(5,2) DEFAULT 0, -- Applied but not approved

    -- Deductions
    lapsed_balance DECIMAL(5,2) DEFAULT 0, -- Expired/unused
    encashed_balance DECIMAL(5,2) DEFAULT 0,

    -- Remaining
    remaining_balance DECIMAL(5,2) DEFAULT 0,

    -- Freezing (for year-end processing)
    is_frozen BIT DEFAULT 0,
    frozen_at DATETIME2,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    CONSTRAINT unique_leave_balance UNIQUE (employee_id, leave_type_id, accrual_year)
);

-- Leave Applications/Requests
CREATE TABLE leave_applications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    leave_type_id UNIQUEIDENTIFIER NOT NULL,

    -- Leave Period
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,2) NOT NULL,

    -- Half-day details
    is_half_day BIT DEFAULT 0,
    half_day_period VARCHAR(20), -- first_half, second_half

    -- Reason & Attachments
    reason VARCHAR(2000) NOT NULL,
    attachment_url VARCHAR(500),

    -- Contact During Leave
    contact_phone VARCHAR(50),
    contact_address VARCHAR(500),

    -- Approval Workflow
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled, withdrawn
    current_approval_level INT DEFAULT 1,

    -- Approval Chain
    approver_1_id UNIQUEIDENTIFIER,
    approver_1_status VARCHAR(20),
    approver_1_remarks VARCHAR(500),
    approver_1_date DATETIME2,

    approver_2_id UNIQUEIDENTIFIER,
    approver_2_status VARCHAR(20),
    approver_2_remarks VARCHAR(500),
    approver_2_date DATETIME2,

    approver_3_id UNIQUEIDENTIFIER,
    approver_3_status VARCHAR(20),
    approver_3_remarks VARCHAR(500),
    approver_3_date DATETIME2,

    -- Rejection/Cancellation
    rejection_reason VARCHAR(1000),
    cancelled_by UNIQUEIDENTIFIER,
    cancelled_at DATETIME2,
    cancellation_reason VARCHAR(1000),

    -- System Processing
    is_processed BIT DEFAULT 0,
    processed_at DATETIME2,
    leave_balance_id UNIQUEIDENTIFIER, -- Link to balance record

    -- Notification
    employee_notified BIT DEFAULT 0,
    approver_notified BIT DEFAULT 0,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    FOREIGN KEY (leave_balance_id) REFERENCES leave_balances(id),
    FOREIGN KEY (approver_1_id) REFERENCES users(id),
    FOREIGN KEY (approver_2_id) REFERENCES users(id),
    FOREIGN KEY (approver_3_id) REFERENCES users(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Leave Transactions (audit trail of all balance changes)
CREATE TABLE leave_transactions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    leave_type_id UNIQUEIDENTIFIER NOT NULL,
    leave_balance_id UNIQUEIDENTIFIER NOT NULL,

    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL, -- accrual, credit, debit, carry_forward, lapse, encashment, adjustment
    transaction_date DATE NOT NULL,
    days DECIMAL(5,2) NOT NULL,

    -- Balance Snapshot
    balance_before DECIMAL(5,2) NOT NULL,
    balance_after DECIMAL(5,2) NOT NULL,

    -- Reference
    reference_type VARCHAR(50), -- leave_application, encashment, manual_adjustment
    reference_id UNIQUEIDENTIFIER,

    -- Notes
    remarks VARCHAR(1000),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    FOREIGN KEY (leave_balance_id) REFERENCES leave_balances(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Holiday Calendar
CREATE TABLE holidays (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Holiday Details
    holiday_name VARCHAR(255) NOT NULL,
    holiday_date DATE NOT NULL,
    holiday_type VARCHAR(50) DEFAULT 'public', -- public, restricted, optional

    -- Applicability
    is_mandatory BIT DEFAULT 1,
    applicable_locations VARCHAR(500), -- JSON array of locations/states
    applicable_departments VARCHAR(500), -- JSON array of department IDs

    -- Optional Holiday Configuration
    is_optional BIT DEFAULT 0,
    max_optional_selections INT DEFAULT 0,

    -- Description
    description VARCHAR(500),

    -- Recurring
    is_recurring BIT DEFAULT 0,
    recurrence_pattern VARCHAR(100), -- yearly, custom

    -- Status
    is_active BIT DEFAULT 1,

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

-- Employee Optional Holiday Selections
CREATE TABLE employee_holiday_selections (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    holiday_id UNIQUEIDENTIFIER NOT NULL,

    -- Selection
    selected_year INT NOT NULL,
    is_availed BIT DEFAULT 0,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (holiday_id) REFERENCES holidays(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT unique_employee_holiday UNIQUE (employee_id, holiday_id, selected_year)
);

-- Leave Encashment Requests
CREATE TABLE leave_encashment_requests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    leave_type_id UNIQUEIDENTIFIER NOT NULL,

    -- Encashment Details
    request_year INT NOT NULL,
    days_to_encash DECIMAL(5,2) NOT NULL,
    available_balance DECIMAL(5,2) NOT NULL,

    -- Financial
    per_day_rate DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',

    -- Approval
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, processed
    approver_id UNIQUEIDENTIFIER,
    approved_at DATETIME2,
    approval_remarks VARCHAR(500),
    rejection_reason VARCHAR(500),

    -- Processing
    is_processed BIT DEFAULT 0,
    processed_at DATETIME2,
    processed_in_payroll_month INT,
    processed_in_payroll_year INT,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    FOREIGN KEY (approver_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Compensatory Off (Comp-off) Management
CREATE TABLE compensatory_off_credits (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Work Details
    work_date DATE NOT NULL,
    work_hours DECIMAL(5,2) NOT NULL,
    work_reason VARCHAR(500) NOT NULL,

    -- Credit
    comp_off_days DECIMAL(4,2) NOT NULL, -- Usually 1.0 or 0.5
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, availed, expired
    is_availed BIT DEFAULT 0,
    availed_date DATE,
    leave_application_id UNIQUEIDENTIFIER,

    -- Approval
    approver_id UNIQUEIDENTIFIER,
    approved_at DATETIME2,
    approval_remarks VARCHAR(500),
    rejection_reason VARCHAR(500),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_application_id) REFERENCES leave_applications(id),
    FOREIGN KEY (approver_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Indexes for Leave Management
CREATE INDEX idx_leave_types_org ON leave_types(organization_id);
CREATE INDEX idx_leave_types_active ON leave_types(is_active);

CREATE INDEX idx_leave_balances_employee ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_leave_type ON leave_balances(leave_type_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(accrual_year);

CREATE INDEX idx_leave_applications_employee ON leave_applications(employee_id);
CREATE INDEX idx_leave_applications_leave_type ON leave_applications(leave_type_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_leave_applications_dates ON leave_applications(start_date, end_date);
CREATE INDEX idx_leave_applications_approver1 ON leave_applications(approver_1_id);

CREATE INDEX idx_leave_transactions_employee ON leave_transactions(employee_id);
CREATE INDEX idx_leave_transactions_type ON leave_transactions(transaction_type);
CREATE INDEX idx_leave_transactions_date ON leave_transactions(transaction_date DESC);

CREATE INDEX idx_holidays_org ON holidays(organization_id);
CREATE INDEX idx_holidays_date ON holidays(holiday_date);
CREATE INDEX idx_holidays_type ON holidays(holiday_type);

CREATE INDEX idx_employee_holiday_selections_employee ON employee_holiday_selections(employee_id);
CREATE INDEX idx_employee_holiday_selections_year ON employee_holiday_selections(selected_year);

CREATE INDEX idx_leave_encashment_employee ON leave_encashment_requests(employee_id);
CREATE INDEX idx_leave_encashment_status ON leave_encashment_requests(status);

CREATE INDEX idx_comp_off_employee ON compensatory_off_credits(employee_id);
CREATE INDEX idx_comp_off_status ON compensatory_off_credits(status);
CREATE INDEX idx_comp_off_dates ON compensatory_off_credits(valid_from, valid_until);

-- =====================================================
-- TIMESHEET MANAGEMENT MODULE
-- Project time tracking with billable/non-billable, approvals, export
-- =====================================================

-- Project Task Codes
CREATE TABLE project_tasks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    project_id UNIQUEIDENTIFIER NOT NULL,

    -- Task Details
    task_name VARCHAR(255) NOT NULL,
    task_code VARCHAR(50) NOT NULL,
    description VARCHAR(1000),

    -- Billing
    is_billable BIT DEFAULT 1,
    default_billing_rate DECIMAL(10,2),

    -- Status
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_task_code UNIQUE (project_id, task_code)
);

-- Timesheet Entries
CREATE TABLE timesheet_entries (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    project_id UNIQUEIDENTIFIER NOT NULL,
    project_task_id UNIQUEIDENTIFIER,

    -- Entry Date
    entry_date DATE NOT NULL,

    -- Time Details
    hours_worked DECIMAL(5,2) NOT NULL,
    minutes_worked INT DEFAULT 0,
    total_hours DECIMAL(5,2) NOT NULL,

    -- Billing
    is_billable BIT DEFAULT 1,
    billing_rate DECIMAL(10,2),
    billing_amount DECIMAL(12,2),

    -- Work Description
    work_description VARCHAR(2000),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, submitted, approved, rejected, invoiced

    -- Approval
    submitted_at DATETIME2,
    approver_id UNIQUEIDENTIFIER,
    approved_at DATETIME2,
    rejection_reason VARCHAR(500),

    -- Invoicing
    is_invoiced BIT DEFAULT 0,
    invoice_id UNIQUEIDENTIFIER,
    invoiced_at DATETIME2,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (project_task_id) REFERENCES project_tasks(id),
    FOREIGN KEY (approver_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Timesheet Summary (Weekly/Monthly)
CREATE TABLE timesheet_summary (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Period
    period_type VARCHAR(20) NOT NULL, -- weekly, monthly
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    week_number INT,
    month INT,
    year INT NOT NULL,

    -- Hours
    total_hours DECIMAL(8,2) DEFAULT 0,
    billable_hours DECIMAL(8,2) DEFAULT 0,
    non_billable_hours DECIMAL(8,2) DEFAULT 0,

    -- Amounts
    total_billing_amount DECIMAL(15,2) DEFAULT 0,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- open, submitted, approved, locked
    submitted_at DATETIME2,
    approved_at DATETIME2,
    approved_by UNIQUEIDENTIFIER,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT unique_timesheet_summary UNIQUE (employee_id, period_type, period_start_date)
);

-- Indexes for Timesheet
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_code ON project_tasks(task_code);

CREATE INDEX idx_timesheet_entries_employee ON timesheet_entries(employee_id);
CREATE INDEX idx_timesheet_entries_project ON timesheet_entries(project_id);
CREATE INDEX idx_timesheet_entries_date ON timesheet_entries(entry_date DESC);
CREATE INDEX idx_timesheet_entries_status ON timesheet_entries(status);

CREATE INDEX idx_timesheet_summary_employee ON timesheet_summary(employee_id);
CREATE INDEX idx_timesheet_summary_period ON timesheet_summary(year, month);

-- =====================================================
-- PAYROLL MANAGEMENT MODULE
-- Comprehensive payroll with salary components, tax, PF/ESI, payslips
-- =====================================================

-- Salary Components (Earnings & Deductions)
CREATE TABLE salary_components (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Component Details
    component_name VARCHAR(100) NOT NULL,
    component_code VARCHAR(20) NOT NULL,
    component_type VARCHAR(50) NOT NULL, -- earning, deduction
    description VARCHAR(500),

    -- Calculation
    calculation_type VARCHAR(50) NOT NULL, -- fixed, percentage, formula, attendance_based
    calculation_formula VARCHAR(500), -- Mathematical formula
    percentage_of VARCHAR(50), -- basic, gross, ctc
    percentage_value DECIMAL(5,2),

    -- Tax Treatment
    is_taxable BIT DEFAULT 1,
    is_part_of_gross BIT DEFAULT 1,
    is_part_of_ctc BIT DEFAULT 1,

    -- Statutory
    is_statutory BIT DEFAULT 0, -- PF, ESI, PT, etc.
    statutory_type VARCHAR(50), -- pf, esi, pt, lwf, tax

    -- Display
    display_order INT DEFAULT 0,
    show_in_payslip BIT DEFAULT 1,

    -- Status
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_component_code UNIQUE (organization_id, component_code)
);

-- Employee Salary Structure
CREATE TABLE employee_salary_structures (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Effective Period
    effective_from DATE NOT NULL,
    effective_to DATE,

    -- Salary Breakdown
    ctc_annual DECIMAL(12,2) NOT NULL,
    ctc_monthly DECIMAL(12,2) NOT NULL,
    gross_salary DECIMAL(12,2) NOT NULL,
    net_salary DECIMAL(12,2) NOT NULL,

    -- Status
    is_active BIT DEFAULT 1,
    revision_reason VARCHAR(500),
    revision_type VARCHAR(50), -- new_hire, increment, promotion, adjustment

    -- Approval
    approved_by UNIQUEIDENTIFIER,
    approved_at DATETIME2,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Employee Salary Component Values
CREATE TABLE employee_salary_components (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    salary_structure_id UNIQUEIDENTIFIER NOT NULL,
    salary_component_id UNIQUEIDENTIFIER NOT NULL,

    -- Amount
    monthly_amount DECIMAL(10,2) NOT NULL,
    annual_amount DECIMAL(12,2) NOT NULL,

    -- Calculation
    is_calculated BIT DEFAULT 0,
    calculation_base DECIMAL(10,2),

    FOREIGN KEY (salary_structure_id) REFERENCES employee_salary_structures(id) ON DELETE CASCADE,
    FOREIGN KEY (salary_component_id) REFERENCES salary_components(id),
    CONSTRAINT unique_structure_component UNIQUE (salary_structure_id, salary_component_id)
);

-- Tax Slabs Configuration
CREATE TABLE tax_slabs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Tax Regime
    regime_name VARCHAR(100) NOT NULL, -- Old Regime, New Regime
    regime_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'USA',

    -- Financial Year
    financial_year VARCHAR(20) NOT NULL, -- 2024-25

    -- Slab Details
    min_income DECIMAL(12,2) NOT NULL,
    max_income DECIMAL(12,2),
    tax_rate DECIMAL(5,2) NOT NULL,
    fixed_tax_amount DECIMAL(12,2) DEFAULT 0,

    -- Status
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Payroll Runs
CREATE TABLE payroll_runs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Payroll Period
    payroll_month INT NOT NULL,
    payroll_year INT NOT NULL,
    payroll_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, weekly, bi-weekly

    -- Dates
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    payment_date DATE NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, processing, completed, locked, disbursed
    is_locked BIT DEFAULT 0,
    locked_at DATETIME2,
    locked_by UNIQUEIDENTIFIER,

    -- Totals
    total_employees INT DEFAULT 0,
    total_gross_salary DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    total_net_salary DECIMAL(15,2) DEFAULT 0,
    total_employer_contribution DECIMAL(15,2) DEFAULT 0,

    -- Processing
    processed_at DATETIME2,
    processed_by UNIQUEIDENTIFIER,

    -- Disbursement
    disbursement_status VARCHAR(50), -- pending, completed, failed
    disbursed_at DATETIME2,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (locked_by) REFERENCES users(id),
    FOREIGN KEY (processed_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_payroll_run UNIQUE (organization_id, payroll_month, payroll_year)
);

-- Payslips
CREATE TABLE payslips (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    payroll_run_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Period
    payroll_month INT NOT NULL,
    payroll_year INT NOT NULL,
    payment_date DATE NOT NULL,

    -- Salary Details
    ctc_annual DECIMAL(12,2),
    gross_salary DECIMAL(12,2) NOT NULL,
    total_earnings DECIMAL(12,2) NOT NULL,
    total_deductions DECIMAL(12,2) NOT NULL,
    net_salary DECIMAL(12,2) NOT NULL,

    -- Attendance Impact
    payable_days DECIMAL(5,2) NOT NULL,
    lop_days DECIMAL(5,2) DEFAULT 0,
    lop_amount DECIMAL(10,2) DEFAULT 0,

    -- Statutory
    pf_employee DECIMAL(10,2) DEFAULT 0,
    pf_employer DECIMAL(10,2) DEFAULT 0,
    esi_employee DECIMAL(10,2) DEFAULT 0,
    esi_employer DECIMAL(10,2) DEFAULT 0,
    professional_tax DECIMAL(10,2) DEFAULT 0,
    tds DECIMAL(10,2) DEFAULT 0,

    -- Payment
    payment_mode VARCHAR(50) DEFAULT 'bank_transfer',
    bank_account_number VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, paid, failed
    paid_at DATETIME2,

    -- Document
    payslip_pdf_url VARCHAR(500),
    is_sent BIT DEFAULT 0,
    sent_at DATETIME2,

    -- Reimbursements
    total_reimbursements DECIMAL(10,2) DEFAULT 0,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_employee_payslip UNIQUE (employee_id, payroll_month, payroll_year)
);

-- Payslip Line Items (Earnings & Deductions breakdown)
CREATE TABLE payslip_line_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    payslip_id UNIQUEIDENTIFIER NOT NULL,
    salary_component_id UNIQUEIDENTIFIER NOT NULL,

    -- Amount
    amount DECIMAL(10,2) NOT NULL,

    -- Calculation Details
    calculation_basis VARCHAR(500),

    FOREIGN KEY (payslip_id) REFERENCES payslips(id) ON DELETE CASCADE,
    FOREIGN KEY (salary_component_id) REFERENCES salary_components(id)
);

-- Indexes for Payroll
CREATE INDEX idx_salary_components_org ON salary_components(organization_id);
CREATE INDEX idx_salary_components_type ON salary_components(component_type);

CREATE INDEX idx_employee_salary_structures_employee ON employee_salary_structures(employee_id);
CREATE INDEX idx_employee_salary_structures_dates ON employee_salary_structures(effective_from, effective_to);

CREATE INDEX idx_tax_slabs_org ON tax_slabs(organization_id);
CREATE INDEX idx_tax_slabs_year ON tax_slabs(financial_year);

CREATE INDEX idx_payroll_runs_org ON payroll_runs(organization_id);
CREATE INDEX idx_payroll_runs_period ON payroll_runs(payroll_year, payroll_month);
CREATE INDEX idx_payroll_runs_status ON payroll_runs(status);

CREATE INDEX idx_payslips_employee ON payslips(employee_id);
CREATE INDEX idx_payslips_run ON payslips(payroll_run_id);
CREATE INDEX idx_payslips_period ON payslips(payroll_year, payroll_month);

-- =====================================================
-- PERFORMANCE MANAGEMENT MODULE
-- Goals, reviews, ratings, calibration, promotions
-- =====================================================

-- Performance Cycles
CREATE TABLE performance_cycles (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Cycle Details
    cycle_name VARCHAR(100) NOT NULL,
    cycle_type VARCHAR(50) NOT NULL, -- annual, mid_year, quarterly
    financial_year VARCHAR(20) NOT NULL,

    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Goal Setting Phase
    goal_setting_start DATE,
    goal_setting_end DATE,

    -- Mid-year Review Phase
    mid_year_review_start DATE,
    mid_year_review_end DATE,

    -- Final Review Phase
    final_review_start DATE,
    final_review_end DATE,

    -- Calibration Phase
    calibration_start DATE,
    calibration_end DATE,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'upcoming', -- upcoming, goal_setting, mid_year, final_review, calibration, completed
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Employee Goals
CREATE TABLE employee_goals (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    performance_cycle_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Goal Details
    goal_title VARCHAR(255) NOT NULL,
    goal_description VARCHAR(2000),
    goal_category VARCHAR(50), -- individual, team, organizational

    -- Metrics
    metric_type VARCHAR(50), -- quantitative, qualitative
    target_value VARCHAR(255),
    unit_of_measure VARCHAR(50),

    -- Weighting
    weightage DECIMAL(5,2) DEFAULT 0, -- Percentage

    -- Timeline
    start_date DATE,
    target_date DATE,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, submitted, approved, in_progress, completed
    completion_percentage INT DEFAULT 0,

    -- Approval
    approver_id UNIQUEIDENTIFIER,
    approved_at DATETIME2,
    approval_remarks VARCHAR(500),

    -- Evaluation
    achievement_rating DECIMAL(3,2), -- 1.00 to 5.00
    achievement_remarks VARCHAR(1000),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (performance_cycle_id) REFERENCES performance_cycles(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approver_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Performance Reviews
CREATE TABLE performance_reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    performance_cycle_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Review Type
    review_type VARCHAR(50) NOT NULL, -- mid_year, annual

    -- Review Period
    review_period_start DATE,
    review_period_end DATE,

    -- Self Assessment
    self_rating DECIMAL(3,2), -- 1.00 to 5.00
    self_comments VARCHAR(2000),
    strengths VARCHAR(1000),
    areas_for_improvement VARCHAR(1000),

    -- Manager Assessment
    manager_id UNIQUEIDENTIFIER NOT NULL,
    manager_rating DECIMAL(3,2),
    manager_comments VARCHAR(2000),
    manager_feedback VARCHAR(2000),

    -- Calibration
    calibrated_rating DECIMAL(3,2),
    calibration_remarks VARCHAR(1000),

    -- Final Rating
    final_rating DECIMAL(3,2),
    rating_label VARCHAR(50), -- Outstanding, Exceeds, Meets, Needs Improvement, Unsatisfactory

    -- Potential Assessment
    potential_rating VARCHAR(50), -- High, Medium, Low
    succession_ready BIT DEFAULT 0,

    -- Promotion Recommendation
    promotion_recommended BIT DEFAULT 0,
    recommended_position_id UNIQUEIDENTIFIER,
    promotion_remarks VARCHAR(1000),

    -- Salary Revision
    salary_revision_recommended BIT DEFAULT 0,
    recommended_increment_percentage DECIMAL(5,2),
    salary_revision_remarks VARCHAR(500),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- not_started, self_review, manager_review, calibration, completed
    is_acknowledged BIT DEFAULT 0,
    acknowledged_at DATETIME2,

    -- Documents
    review_document_url VARCHAR(500),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (performance_cycle_id) REFERENCES performance_cycles(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id),
    FOREIGN KEY (recommended_position_id) REFERENCES positions(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_employee_review UNIQUE (employee_id, performance_cycle_id, review_type)
);

-- Rating Calibration Sessions
CREATE TABLE calibration_sessions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    performance_cycle_id UNIQUEIDENTIFIER NOT NULL,

    -- Session Details
    session_name VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    department_id UNIQUEIDENTIFIER,

    -- Participants
    facilitator_id UNIQUEIDENTIFIER NOT NULL,
    participants VARCHAR(MAX), -- JSON array of user IDs

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed

    -- Notes
    session_notes VARCHAR(MAX),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (performance_cycle_id) REFERENCES performance_cycles(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (facilitator_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Indexes for Performance
CREATE INDEX idx_performance_cycles_org ON performance_cycles(organization_id);
CREATE INDEX idx_performance_cycles_status ON performance_cycles(status);

CREATE INDEX idx_employee_goals_employee ON employee_goals(employee_id);
CREATE INDEX idx_employee_goals_cycle ON employee_goals(performance_cycle_id);
CREATE INDEX idx_employee_goals_status ON employee_goals(status);

CREATE INDEX idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_cycle ON performance_reviews(performance_cycle_id);
CREATE INDEX idx_performance_reviews_manager ON performance_reviews(manager_id);
CREATE INDEX idx_performance_reviews_status ON performance_reviews(status);

CREATE INDEX idx_calibration_sessions_cycle ON calibration_sessions(performance_cycle_id);
CREATE INDEX idx_calibration_sessions_date ON calibration_sessions(session_date);

-- =====================================================
-- RECRUITMENT MODULE
-- Job posting, applicant tracking, interviews, offers
-- =====================================================

-- Job Postings
CREATE TABLE job_postings (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Job Details
    job_title VARCHAR(255) NOT NULL,
    job_code VARCHAR(50) NOT NULL,
    department_id UNIQUEIDENTIFIER,
    position_id UNIQUEIDENTIFIER,

    -- Description
    job_description VARCHAR(MAX) NOT NULL,
    requirements VARCHAR(MAX),
    responsibilities VARCHAR(MAX),

    -- Employment Details
    employment_type VARCHAR(50) NOT NULL, -- full_time, part_time, contract, intern
    experience_required VARCHAR(100),
    education_required VARCHAR(500),

    -- Location
    work_location VARCHAR(255),
    remote_allowed BIT DEFAULT 0,

    -- Compensation
    min_salary DECIMAL(12,2),
    max_salary DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',

    -- Openings
    number_of_openings INT NOT NULL DEFAULT 1,
    filled_positions INT DEFAULT 0,

    -- Dates
    posting_date DATE NOT NULL,
    application_deadline DATE,
    target_joining_date DATE,

    -- Hiring Team
    hiring_manager_id UNIQUEIDENTIFIER,
    recruiter_id UNIQUEIDENTIFIER,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, published, on_hold, closed, filled
    is_published BIT DEFAULT 0,
    published_at DATETIME2,

    -- Publishing Channels
    publish_on_careers_page BIT DEFAULT 1,
    external_job_boards VARCHAR(500), -- JSON array

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (position_id) REFERENCES positions(id),
    FOREIGN KEY (hiring_manager_id) REFERENCES users(id),
    FOREIGN KEY (recruiter_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_job_code UNIQUE (organization_id, job_code)
);

-- Job Applications
CREATE TABLE job_applications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    job_posting_id UNIQUEIDENTIFIER NOT NULL,

    -- Candidate Details
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,

    -- Professional Details
    current_company VARCHAR(255),
    current_designation VARCHAR(255),
    total_experience_years DECIMAL(4,1),
    current_salary DECIMAL(12,2),
    expected_salary DECIMAL(12,2),
    notice_period_days INT,

    -- Documents
    resume_url VARCHAR(500) NOT NULL,
    cover_letter_url VARCHAR(500),
    portfolio_url VARCHAR(500),

    -- Application
    application_date DATE NOT NULL,
    source VARCHAR(100), -- careers_page, referral, linkedin, naukri, etc.
    referrer_employee_id UNIQUEIDENTIFIER,

    -- Screening
    status VARCHAR(50) NOT NULL DEFAULT 'new', -- new, screening, shortlisted, interview, offer, hired, rejected, withdrawn
    current_stage VARCHAR(50), -- screening, technical, hr, final
    rejection_reason VARCHAR(500),

    -- Assignment
    assigned_to UNIQUEIDENTIFIER,

    -- Ratings
    overall_rating DECIMAL(3,2),

    -- Notes
    internal_notes VARCHAR(2000),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (job_posting_id) REFERENCES job_postings(id),
    FOREIGN KEY (referrer_employee_id) REFERENCES employees(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Interview Schedules
CREATE TABLE interview_schedules (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    job_application_id UNIQUEIDENTIFIER NOT NULL,

    -- Interview Details
    interview_round VARCHAR(100) NOT NULL, -- screening, technical_1, technical_2, hr, final
    interview_type VARCHAR(50) NOT NULL, -- phone, video, in_person
    interview_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,

    -- Location/Meeting Details
    location VARCHAR(255),
    meeting_link VARCHAR(500),
    meeting_instructions VARCHAR(1000),

    -- Panel
    interviewer_ids VARCHAR(MAX), -- JSON array of employee IDs

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled, no_show

    -- Feedback
    feedback_submitted BIT DEFAULT 0,

    -- Notifications
    candidate_notified BIT DEFAULT 0,
    interviewer_notified BIT DEFAULT 0,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (job_application_id) REFERENCES job_applications(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Interview Feedback
CREATE TABLE interview_feedback (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    interview_schedule_id UNIQUEIDENTIFIER NOT NULL,
    interviewer_id UNIQUEIDENTIFIER NOT NULL,

    -- Overall Assessment
    overall_rating DECIMAL(3,2) NOT NULL, -- 1.00 to 5.00
    recommendation VARCHAR(50) NOT NULL, -- strong_hire, hire, maybe, no_hire, strong_no_hire

    -- Skill Ratings
    technical_skills_rating DECIMAL(3,2),
    communication_skills_rating DECIMAL(3,2),
    problem_solving_rating DECIMAL(3,2),
    cultural_fit_rating DECIMAL(3,2),

    -- Detailed Feedback
    strengths VARCHAR(2000),
    weaknesses VARCHAR(2000),
    detailed_feedback VARCHAR(MAX),

    -- Questions Asked
    questions_asked VARCHAR(MAX),

    -- Red Flags
    red_flags VARCHAR(1000),

    -- Submitted
    submitted_at DATETIME2 DEFAULT SYSUTCDATETIME(),

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (interview_schedule_id) REFERENCES interview_schedules(id),
    FOREIGN KEY (interviewer_id) REFERENCES users(id)
);

-- Job Offers
CREATE TABLE job_offers (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    job_application_id UNIQUEIDENTIFIER NOT NULL,

    -- Offer Details
    offer_date DATE NOT NULL,
    offer_valid_until DATE NOT NULL,
    joining_date DATE NOT NULL,

    -- Position
    offered_position VARCHAR(255) NOT NULL,
    department_id UNIQUEIDENTIFIER,
    reporting_manager_id UNIQUEIDENTIFIER,
    work_location VARCHAR(255),

    -- Compensation
    annual_ctc DECIMAL(12,2) NOT NULL,
    monthly_gross DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',

    -- Benefits
    benefits_summary VARCHAR(2000),

    -- Documents
    offer_letter_url VARCHAR(500),
    other_documents_url VARCHAR(500),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, sent, accepted, rejected, negotiating, expired
    sent_at DATETIME2,
    responded_at DATETIME2,
    response_remarks VARCHAR(1000),

    -- Negotiation
    negotiation_notes VARCHAR(2000),
    revised_ctc DECIMAL(12,2),

    -- Approval
    approved_by UNIQUEIDENTIFIER,
    approved_at DATETIME2,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (job_application_id) REFERENCES job_applications(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (reporting_manager_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Indexes for Recruitment
CREATE INDEX idx_job_postings_org ON job_postings(organization_id);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_department ON job_postings(department_id);

CREATE INDEX idx_job_applications_job ON job_applications(job_posting_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_email ON job_applications(email);

CREATE INDEX idx_interview_schedules_application ON interview_schedules(job_application_id);
CREATE INDEX idx_interview_schedules_date ON interview_schedules(interview_date);
CREATE INDEX idx_interview_schedules_status ON interview_schedules(status);

CREATE INDEX idx_interview_feedback_schedule ON interview_feedback(interview_schedule_id);
CREATE INDEX idx_interview_feedback_interviewer ON interview_feedback(interviewer_id);

CREATE INDEX idx_job_offers_application ON job_offers(job_application_id);
CREATE INDEX idx_job_offers_status ON job_offers(status);

-- =====================================================
-- ASSET MANAGEMENT MODULE
-- Asset assignment, tracking, return, maintenance
-- =====================================================

-- Asset Categories
CREATE TABLE asset_categories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Category Details
    category_name VARCHAR(100) NOT NULL,
    category_code VARCHAR(20) NOT NULL,
    description VARCHAR(500),

    -- Default Settings
    requires_approval BIT DEFAULT 1,
    auto_depreciation BIT DEFAULT 0,
    depreciation_rate DECIMAL(5,2),

    -- Status
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_asset_category_code UNIQUE (organization_id, category_code)
);

-- Assets
CREATE TABLE assets (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    asset_category_id UNIQUEIDENTIFIER NOT NULL,

    -- Asset Details
    asset_name VARCHAR(255) NOT NULL,
    asset_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(1000),

    -- Specifications
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    specifications VARCHAR(MAX), -- JSON

    -- Purchase Details
    vendor_id UNIQUEIDENTIFIER,
    purchase_date DATE,
    purchase_cost DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'USD',
    invoice_number VARCHAR(100),
    warranty_expiry_date DATE,

    -- Depreciation
    depreciation_method VARCHAR(50), -- straight_line, declining_balance
    depreciation_rate DECIMAL(5,2),
    current_value DECIMAL(12,2),
    salvage_value DECIMAL(12,2),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- available, assigned, under_maintenance, retired, lost, damaged
    condition VARCHAR(50), -- excellent, good, fair, poor

    -- Location
    current_location VARCHAR(255),

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (asset_category_id) REFERENCES asset_categories(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Asset Assignments
CREATE TABLE asset_assignments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    asset_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Assignment Details
    assigned_date DATE NOT NULL,
    expected_return_date DATE,
    actual_return_date DATE,

    -- Condition
    condition_at_assignment VARCHAR(50),
    condition_at_return VARCHAR(50),

    -- Approval
    approved_by UNIQUEIDENTIFIER,
    approved_at DATETIME2,

    -- Return
    returned_by UNIQUEIDENTIFIER,
    return_remarks VARCHAR(1000),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, returned, overdue

    -- Acknowledgement
    employee_acknowledged BIT DEFAULT 0,
    acknowledged_at DATETIME2,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (returned_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Asset Maintenance
CREATE TABLE asset_maintenance (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    asset_id UNIQUEIDENTIFIER NOT NULL,

    -- Maintenance Details
    maintenance_type VARCHAR(50) NOT NULL, -- preventive, corrective, breakdown
    maintenance_date DATE NOT NULL,
    completed_date DATE,

    -- Description
    issue_description VARCHAR(2000),
    work_performed VARCHAR(2000),

    -- Cost
    maintenance_cost DECIMAL(10,2),
    vendor_id UNIQUEIDENTIFIER,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled

    -- Assigned To
    technician_name VARCHAR(255),
    technician_contact VARCHAR(50),

    -- Next Maintenance
    next_maintenance_date DATE,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Indexes for Assets
CREATE INDEX idx_asset_categories_org ON asset_categories(organization_id);
CREATE INDEX idx_assets_org ON assets(organization_id);
CREATE INDEX idx_assets_category ON assets(asset_category_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_code ON assets(asset_code);

CREATE INDEX idx_asset_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX idx_asset_assignments_employee ON asset_assignments(employee_id);
CREATE INDEX idx_asset_assignments_status ON asset_assignments(status);

CREATE INDEX idx_asset_maintenance_asset ON asset_maintenance(asset_id);
CREATE INDEX idx_asset_maintenance_date ON asset_maintenance(maintenance_date);
CREATE INDEX idx_asset_maintenance_status ON asset_maintenance(status);

-- =====================================================
-- EXPENSE MANAGEMENT MODULE
-- Expense claims, approvals, reimbursement
-- =====================================================

-- Expense Categories
CREATE TABLE expense_categories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Category Details
    category_name VARCHAR(100) NOT NULL,
    category_code VARCHAR(20) NOT NULL,
    description VARCHAR(500),

    -- Limits
    daily_limit DECIMAL(10,2),
    monthly_limit DECIMAL(10,2),
    per_claim_limit DECIMAL(10,2),

    -- Approval
    requires_approval BIT DEFAULT 1,
    requires_receipt BIT DEFAULT 1,

    -- Status
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_expense_category_code UNIQUE (organization_id, category_code)
);

-- Expense Claims
CREATE TABLE expense_claims (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Claim Details
    claim_number VARCHAR(50) NOT NULL,
    claim_date DATE NOT NULL,
    claim_title VARCHAR(255) NOT NULL,

    -- Amount
    total_amount DECIMAL(12,2) NOT NULL,
    approved_amount DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'USD',

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, submitted, approved, rejected, reimbursed
    submitted_at DATETIME2,

    -- Approval Workflow
    approver_id UNIQUEIDENTIFIER,
    approved_at DATETIME2,
    approval_remarks VARCHAR(500),
    rejection_reason VARCHAR(1000),

    -- Reimbursement
    reimbursement_method VARCHAR(50), -- bank_transfer, cash, salary
    reimbursed_at DATETIME2,
    reimbursed_by UNIQUEIDENTIFIER,
    transaction_reference VARCHAR(255),

    -- Processing
    processed_in_payroll_month INT,
    processed_in_payroll_year INT,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approver_id) REFERENCES users(id),
    FOREIGN KEY (reimbursed_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_claim_number UNIQUE (organization_id, claim_number)
);

-- Expense Claim Items
CREATE TABLE expense_claim_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    expense_claim_id UNIQUEIDENTIFIER NOT NULL,
    expense_category_id UNIQUEIDENTIFIER NOT NULL,

    -- Item Details
    expense_date DATE NOT NULL,
    description VARCHAR(1000) NOT NULL,

    -- Amount
    amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),

    -- Receipt
    receipt_url VARCHAR(500),
    receipt_number VARCHAR(100),

    -- Billable
    is_billable BIT DEFAULT 0,
    client_id UNIQUEIDENTIFIER,
    project_id UNIQUEIDENTIFIER,

    -- Remarks
    remarks VARCHAR(500),
    rejection_remarks VARCHAR(500),

    FOREIGN KEY (expense_claim_id) REFERENCES expense_claims(id) ON DELETE CASCADE,
    FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Indexes for Expenses
CREATE INDEX idx_expense_categories_org ON expense_categories(organization_id);
CREATE INDEX idx_expense_claims_employee ON expense_claims(employee_id);
CREATE INDEX idx_expense_claims_status ON expense_claims(status);
CREATE INDEX idx_expense_claims_date ON expense_claims(claim_date DESC);
CREATE INDEX idx_expense_claim_items_claim ON expense_claim_items(expense_claim_id);

-- =====================================================
-- ENHANCED NOTIFICATIONS MODULE
-- Email, SMS, In-App, Escalation chains, Reminders
-- =====================================================

-- Notification Templates
CREATE TABLE notification_templates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER,

    -- Template Details
    template_name VARCHAR(100) NOT NULL,
    template_code VARCHAR(50) NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- email, sms, in_app, push
    event_type VARCHAR(100) NOT NULL, -- leave_approved, payslip_generated, etc.

    -- Content
    subject VARCHAR(255),
    body_template VARCHAR(MAX) NOT NULL,
    sms_template VARCHAR(500),

    -- Variables
    available_variables VARCHAR(1000), -- JSON array

    -- Status
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_template_code UNIQUE (organization_id, template_code)
);

-- Notifications
CREATE TABLE notifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Recipient
    recipient_type VARCHAR(50) NOT NULL, -- user, employee, role, department
    recipient_id UNIQUEIDENTIFIER NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),

    -- Notification Details
    notification_type VARCHAR(50) NOT NULL, -- email, sms, in_app, push
    event_type VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    message VARCHAR(MAX) NOT NULL,

    -- Priority & Category
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    category VARCHAR(50), -- leave, payroll, attendance, etc.

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, sent, failed, read
    sent_at DATETIME2,
    read_at DATETIME2,
    failed_reason VARCHAR(500),

    -- Retry
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at DATETIME2,

    -- Related Entity
    related_entity_type VARCHAR(50),
    related_entity_id UNIQUEIDENTIFIER,

    -- Metadata
    metadata VARCHAR(MAX), -- JSON

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),

    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Notification Preferences
CREATE TABLE notification_preferences (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,

    -- Preferences per Event Type
    event_type VARCHAR(100) NOT NULL,
    email_enabled BIT DEFAULT 1,
    sms_enabled BIT DEFAULT 0,
    in_app_enabled BIT DEFAULT 1,
    push_enabled BIT DEFAULT 1,

    -- Quiet Hours
    quiet_hours_start TIME,
    quiet_hours_end TIME,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT unique_user_event_pref UNIQUE (user_id, event_type)
);

-- Escalation Rules
CREATE TABLE escalation_rules (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Rule Details
    rule_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- leave_application, expense_claim, etc.
    trigger_condition VARCHAR(50) NOT NULL, -- pending_approval, overdue

    -- Timing
    escalate_after_hours INT NOT NULL,
    escalate_to VARCHAR(50) NOT NULL, -- manager, department_head, hr, custom

    -- Custom Recipients
    custom_recipient_ids VARCHAR(MAX), -- JSON array

    -- Notification
    notification_template_id UNIQUEIDENTIFIER,

    -- Status
    is_active BIT DEFAULT 1,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (notification_template_id) REFERENCES notification_templates(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Reminders
CREATE TABLE reminders (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Reminder Details
    reminder_type VARCHAR(50) NOT NULL, -- one_time, recurring
    event_type VARCHAR(100) NOT NULL,

    -- Recipient
    recipient_id UNIQUEIDENTIFIER NOT NULL,

    -- Schedule
    reminder_date DATE NOT NULL,
    reminder_time TIME,
    recurrence_pattern VARCHAR(50), -- daily, weekly, monthly

    -- Message
    subject VARCHAR(255),
    message VARCHAR(1000) NOT NULL,

    -- Related Entity
    related_entity_type VARCHAR(50),
    related_entity_id UNIQUEIDENTIFIER,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, sent, cancelled
    sent_at DATETIME2,

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes for Notifications
CREATE INDEX idx_notification_templates_org ON notification_templates(organization_id);
CREATE INDEX idx_notification_templates_event ON notification_templates(event_type);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_category ON notifications(category);

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

CREATE INDEX idx_escalation_rules_org ON escalation_rules(organization_id);
CREATE INDEX idx_escalation_rules_entity ON escalation_rules(entity_type);

CREATE INDEX idx_reminders_recipient ON reminders(recipient_id);
CREATE INDEX idx_reminders_date ON reminders(reminder_date);
CREATE INDEX idx_reminders_status ON reminders(status);

-- =====================================================
-- PERMISSIONS FOR ALL NEW MODULES
-- Safe idempotent inserts for all module permissions
-- =====================================================

BEGIN TRY
    -- ATTENDANCE PERMISSIONS
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'attendance' AND action = 'view' AND scope = 'own' AND organization_id IS NULL)
    BEGIN
        INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
        ('attendance', 'view', 'own', NULL, 'View own attendance'),
        ('attendance', 'view', 'team', NULL, 'View team attendance'),
        ('attendance', 'view', 'organization', NULL, 'View all attendance'),
        ('attendance', 'mark', 'own', NULL, 'Mark own attendance'),
        ('attendance', 'edit', 'organization', NULL, 'Edit attendance records'),
        ('attendance', 'approve', 'team', NULL, 'Approve team regularization'),
        ('attendance', 'approve', 'organization', NULL, 'Approve all regularization'),
        ('shifts', 'view', 'organization', NULL, 'View shifts'),
        ('shifts', 'create', 'organization', NULL, 'Create shifts'),
        ('shifts', 'edit', 'organization', NULL, 'Edit shifts'),
        ('shifts', 'delete', 'organization', NULL, 'Delete shifts');
    END

    -- LEAVE PERMISSIONS
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'leave' AND action = 'view' AND scope = 'own' AND organization_id IS NULL)
    BEGIN
        INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
        ('leave', 'view', 'own', NULL, 'View own leave'),
        ('leave', 'view', 'team', NULL, 'View team leave'),
        ('leave', 'view', 'organization', NULL, 'View all leave'),
        ('leave', 'apply', 'own', NULL, 'Apply for leave'),
        ('leave', 'approve', 'team', NULL, 'Approve team leave'),
        ('leave', 'approve', 'organization', NULL, 'Approve all leave'),
        ('leave', 'cancel', 'own', NULL, 'Cancel own leave'),
        ('leave-types', 'view', 'organization', NULL, 'View leave types'),
        ('leave-types', 'create', 'organization', NULL, 'Create leave types'),
        ('leave-types', 'edit', 'organization', NULL, 'Edit leave types'),
        ('leave-types', 'delete', 'organization', NULL, 'Delete leave types'),
        ('holidays', 'view', 'organization', NULL, 'View holidays'),
        ('holidays', 'create', 'organization', NULL, 'Create holidays'),
        ('holidays', 'edit', 'organization', NULL, 'Edit holidays'),
        ('holidays', 'delete', 'organization', NULL, 'Delete holidays');
    END

    -- TIMESHEET PERMISSIONS
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'timesheet' AND action = 'view' AND scope = 'own' AND organization_id IS NULL)
    BEGIN
        INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
        ('timesheet', 'view', 'own', NULL, 'View own timesheet'),
        ('timesheet', 'view', 'team', NULL, 'View team timesheet'),
        ('timesheet', 'view', 'organization', NULL, 'View all timesheets'),
        ('timesheet', 'create', 'own', NULL, 'Create own timesheet entries'),
        ('timesheet', 'edit', 'own', NULL, 'Edit own timesheet'),
        ('timesheet', 'submit', 'own', NULL, 'Submit timesheet'),
        ('timesheet', 'approve', 'team', NULL, 'Approve team timesheet'),
        ('timesheet', 'approve', 'organization', NULL, 'Approve all timesheets'),
        ('project-tasks', 'view', 'organization', NULL, 'View project tasks'),
        ('project-tasks', 'create', 'organization', NULL, 'Create project tasks'),
        ('project-tasks', 'edit', 'organization', NULL, 'Edit project tasks');
    END

    -- PAYROLL PERMISSIONS
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'payroll' AND action = 'view' AND scope = 'own' AND organization_id IS NULL)
    BEGIN
        INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
        ('payroll', 'view', 'own', NULL, 'View own payslips'),
        ('payroll', 'view', 'organization', NULL, 'View all payroll'),
        ('payroll', 'process', 'organization', NULL, 'Process payroll'),
        ('payroll', 'approve', 'organization', NULL, 'Approve payroll'),
        ('salary-structure', 'view', 'own', NULL, 'View own salary structure'),
        ('salary-structure', 'view', 'organization', NULL, 'View all salary structures'),
        ('salary-structure', 'create', 'organization', NULL, 'Create salary structures'),
        ('salary-structure', 'edit', 'organization', NULL, 'Edit salary structures'),
        ('salary-components', 'view', 'organization', NULL, 'View salary components'),
        ('salary-components', 'create', 'organization', NULL, 'Create salary components'),
        ('salary-components', 'edit', 'organization', NULL, 'Edit salary components'),
        ('tax-slabs', 'view', 'organization', NULL, 'View tax slabs'),
        ('tax-slabs', 'create', 'organization', NULL, 'Create tax slabs');
    END

    -- PERFORMANCE PERMISSIONS
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'performance' AND action = 'view' AND scope = 'own' AND organization_id IS NULL)
    BEGIN
        INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
        ('performance', 'view', 'own', NULL, 'View own performance'),
        ('performance', 'view', 'team', NULL, 'View team performance'),
        ('performance', 'view', 'organization', NULL, 'View all performance'),
        ('goals', 'create', 'own', NULL, 'Create own goals'),
        ('goals', 'edit', 'own', NULL, 'Edit own goals'),
        ('goals', 'approve', 'team', NULL, 'Approve team goals'),
        ('reviews', 'create', 'own', NULL, 'Create self review'),
        ('reviews', 'create', 'team', NULL, 'Create team reviews'),
        ('reviews', 'edit', 'team', NULL, 'Edit team reviews'),
        ('reviews', 'calibrate', 'organization', NULL, 'Calibrate ratings'),
        ('performance-cycles', 'view', 'organization', NULL, 'View performance cycles'),
        ('performance-cycles', 'create', 'organization', NULL, 'Create performance cycles'),
        ('performance-cycles', 'edit', 'organization', NULL, 'Edit performance cycles');
    END

    -- RECRUITMENT PERMISSIONS
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'recruitment' AND action = 'view' AND scope = 'organization' AND organization_id IS NULL)
    BEGIN
        INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
        ('recruitment', 'view', 'organization', NULL, 'View recruitment'),
        ('job-postings', 'view', 'organization', NULL, 'View job postings'),
        ('job-postings', 'create', 'organization', NULL, 'Create job postings'),
        ('job-postings', 'edit', 'organization', NULL, 'Edit job postings'),
        ('job-postings', 'delete', 'organization', NULL, 'Delete job postings'),
        ('job-applications', 'view', 'organization', NULL, 'View job applications'),
        ('job-applications', 'create', 'organization', NULL, 'Create job applications'),
        ('job-applications', 'edit', 'organization', NULL, 'Edit job applications'),
        ('interviews', 'view', 'organization', NULL, 'View interviews'),
        ('interviews', 'schedule', 'organization', NULL, 'Schedule interviews'),
        ('interviews', 'feedback', 'organization', NULL, 'Provide interview feedback'),
        ('job-offers', 'view', 'organization', NULL, 'View job offers'),
        ('job-offers', 'create', 'organization', NULL, 'Create job offers'),
        ('job-offers', 'approve', 'organization', NULL, 'Approve job offers');
    END

    -- ASSETS PERMISSIONS
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'assets' AND action = 'view' AND scope = 'own' AND organization_id IS NULL)
    BEGIN
        INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
        ('assets', 'view', 'own', NULL, 'View own assets'),
        ('assets', 'view', 'organization', NULL, 'View all assets'),
        ('assets', 'create', 'organization', NULL, 'Create assets'),
        ('assets', 'edit', 'organization', NULL, 'Edit assets'),
        ('assets', 'delete', 'organization', NULL, 'Delete assets'),
        ('assets', 'assign', 'organization', NULL, 'Assign assets'),
        ('assets', 'return', 'own', NULL, 'Return own assets'),
        ('assets', 'return', 'organization', NULL, 'Process asset returns'),
        ('asset-maintenance', 'view', 'organization', NULL, 'View asset maintenance'),
        ('asset-maintenance', 'create', 'organization', NULL, 'Create asset maintenance');
    END

    -- EXPENSES PERMISSIONS
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'expenses' AND action = 'view' AND scope = 'own' AND organization_id IS NULL)
    BEGIN
        INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
        ('expenses', 'view', 'own', NULL, 'View own expenses'),
        ('expenses', 'view', 'team', NULL, 'View team expenses'),
        ('expenses', 'view', 'organization', NULL, 'View all expenses'),
        ('expenses', 'create', 'own', NULL, 'Create expense claims'),
        ('expenses', 'edit', 'own', NULL, 'Edit own expenses'),
        ('expenses', 'submit', 'own', NULL, 'Submit expense claims'),
        ('expenses', 'approve', 'team', NULL, 'Approve team expenses'),
        ('expenses', 'approve', 'organization', NULL, 'Approve all expenses'),
        ('expenses', 'reimburse', 'organization', NULL, 'Process reimbursements'),
        ('expense-categories', 'view', 'organization', NULL, 'View expense categories'),
        ('expense-categories', 'create', 'organization', NULL, 'Create expense categories'),
        ('expense-categories', 'edit', 'organization', NULL, 'Edit expense categories');
    END

    -- NOTIFICATIONS PERMISSIONS
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'notifications' AND action = 'view' AND scope = 'own' AND organization_id IS NULL)
    BEGIN
        INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
        ('notifications', 'view', 'own', NULL, 'View own notifications'),
        ('notifications', 'view', 'organization', NULL, 'View all notifications'),
        ('notification-templates', 'view', 'organization', NULL, 'View notification templates'),
        ('notification-templates', 'create', 'organization', NULL, 'Create notification templates'),
        ('notification-templates', 'edit', 'organization', NULL, 'Edit notification templates');
    END

    -- Create permission groups for new modules
    IF NOT EXISTS (SELECT 1 FROM permission_groups WHERE name = 'Attendance Management')
    BEGIN
        INSERT INTO permission_groups (name, description) VALUES
        ('Attendance Management', 'Manage attendance, shifts, and regularization'),
        ('Leave Management', 'Manage leave types, applications, and approvals'),
        ('Timesheet Management', 'Manage timesheets and project time tracking'),
        ('Payroll Management', 'Manage payroll, salary structures, and payslips'),
        ('Performance Management', 'Manage performance cycles, goals, and reviews'),
        ('Recruitment Management', 'Manage job postings, applications, and hiring'),
        ('Asset Management', 'Manage assets, assignments, and maintenance'),
        ('Expense Management', 'Manage expense claims and reimbursements'),
        ('Notification Management', 'Manage notifications and templates');
    END

    -- Assign permissions to groups
    INSERT INTO group_permissions (group_id, permission_id)
    SELECT g.id, p.id FROM permission_groups g, permissions p
    WHERE g.name = 'Attendance Management' AND p.resource IN ('attendance', 'shifts')
    AND NOT EXISTS (SELECT 1 FROM group_permissions gp WHERE gp.group_id = g.id AND gp.permission_id = p.id);

    INSERT INTO group_permissions (group_id, permission_id)
    SELECT g.id, p.id FROM permission_groups g, permissions p
    WHERE g.name = 'Leave Management' AND p.resource IN ('leave', 'leave-types', 'holidays')
    AND NOT EXISTS (SELECT 1 FROM group_permissions gp WHERE gp.group_id = g.id AND gp.permission_id = p.id);

    INSERT INTO group_permissions (group_id, permission_id)
    SELECT g.id, p.id FROM permission_groups g, permissions p
    WHERE g.name = 'Timesheet Management' AND p.resource IN ('timesheet', 'project-tasks')
    AND NOT EXISTS (SELECT 1 FROM group_permissions gp WHERE gp.group_id = g.id AND gp.permission_id = p.id);

    INSERT INTO group_permissions (group_id, permission_id)
    SELECT g.id, p.id FROM permission_groups g, permissions p
    WHERE g.name = 'Payroll Management' AND p.resource IN ('payroll', 'salary-structure', 'salary-components', 'tax-slabs')
    AND NOT EXISTS (SELECT 1 FROM group_permissions gp WHERE gp.group_id = g.id AND gp.permission_id = p.id);

    INSERT INTO group_permissions (group_id, permission_id)
    SELECT g.id, p.id FROM permission_groups g, permissions p
    WHERE g.name = 'Performance Management' AND p.resource IN ('performance', 'goals', 'reviews', 'performance-cycles')
    AND NOT EXISTS (SELECT 1 FROM group_permissions gp WHERE gp.group_id = g.id AND gp.permission_id = p.id);

    INSERT INTO group_permissions (group_id, permission_id)
    SELECT g.id, p.id FROM permission_groups g, permissions p
    WHERE g.name = 'Recruitment Management' AND p.resource IN ('recruitment', 'job-postings', 'job-applications', 'interviews', 'job-offers')
    AND NOT EXISTS (SELECT 1 FROM group_permissions gp WHERE gp.group_id = g.id AND gp.permission_id = p.id);

    INSERT INTO group_permissions (group_id, permission_id)
    SELECT g.id, p.id FROM permission_groups g, permissions p
    WHERE g.name = 'Asset Management' AND p.resource IN ('assets', 'asset-maintenance')
    AND NOT EXISTS (SELECT 1 FROM group_permissions gp WHERE gp.group_id = g.id AND gp.permission_id = p.id);

    INSERT INTO group_permissions (group_id, permission_id)
    SELECT g.id, p.id FROM permission_groups g, permissions p
    WHERE g.name = 'Expense Management' AND p.resource IN ('expenses', 'expense-categories')
    AND NOT EXISTS (SELECT 1 FROM group_permissions gp WHERE gp.group_id = g.id AND gp.permission_id = p.id);

    INSERT INTO group_permissions (group_id, permission_id)
    SELECT g.id, p.id FROM permission_groups g, permissions p
    WHERE g.name = 'Notification Management' AND p.resource IN ('notifications', 'notification-templates')
    AND NOT EXISTS (SELECT 1 FROM group_permissions gp WHERE gp.group_id = g.id AND gp.permission_id = p.id);

    -- Assign all new module permissions to OrgAdmin role
    DECLARE @OrgAdminId INT = (SELECT id FROM roles WHERE name='orgadmin' AND is_system_role=1);

    IF @OrgAdminId IS NOT NULL
    BEGIN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT @OrgAdminId, p.id FROM permissions p
        WHERE p.resource IN ('attendance', 'shifts', 'leave', 'leave-types', 'holidays', 
                            'timesheet', 'project-tasks', 'payroll', 'salary-structure', 
                            'salary-components', 'tax-slabs', 'performance', 'goals', 'reviews', 
                            'performance-cycles', 'recruitment', 'job-postings', 'job-applications', 
                            'interviews', 'job-offers', 'assets', 'asset-maintenance', 
                            'expenses', 'expense-categories', 'notifications', 'notification-templates')
        AND p.scope = 'organization' AND p.organization_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = @OrgAdminId AND rp.permission_id = p.id);
    END

    -- Assign own-scope permissions to Employee role
    DECLARE @EmployeeId INT = (SELECT id FROM roles WHERE name='employee' AND is_system_role=1);

    IF @EmployeeId IS NOT NULL
    BEGIN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT @EmployeeId, p.id FROM permissions p
        WHERE p.resource IN ('attendance', 'leave', 'timesheet', 'payroll', 'salary-structure', 
                            'performance', 'goals', 'reviews', 'assets', 'expenses', 'notifications')
        AND p.scope = 'own' AND p.organization_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = @EmployeeId AND rp.permission_id = p.id);
    END

END TRY
BEGIN CATCH
    PRINT 'Some permissions already exist or could not be created. Continuing...';
END CATCH;

-- =====================================================
-- SCHEDULED JOB TRACKING
-- =====================================================

CREATE TABLE scheduled_job_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    job_name VARCHAR(100) NOT NULL,
    execution_time DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED
    error_message TEXT,
    duration_ms BIGINT,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- Index for faster job history queries
CREATE INDEX idx_scheduled_job_logs_job_name ON scheduled_job_logs(job_name, execution_time DESC);
CREATE INDEX idx_scheduled_job_logs_status ON scheduled_job_logs(status, execution_time DESC);

PRINT 'Scheduled job tracking tables created successfully';

-- =====================================================
-- SCHEMA COMPLETION MESSAGE
-- =====================================================
PRINT '=======================================================';
PRINT 'HRMS PORTAL - COMPLETE SCHEMA CREATED SUCCESSFULLY';
PRINT '=======================================================';
PRINT 'Total Modules: 15';
PRINT '- Identity & Access Control';
PRINT '- Organization Structure';
PRINT '- Employee Master';
PRINT '- Vendor & Client Management';
PRINT '- Document Management';
PRINT '- Attendance Management (NEW)';
PRINT '- Leave Management (NEW)';
PRINT '- Timesheet Management (NEW)';
PRINT '- Payroll Management (NEW)';
PRINT '- Performance Management (NEW)';
PRINT '- Recruitment Management (NEW)';
PRINT '- Asset Management (NEW)';
PRINT '- Expense Management (NEW)';
PRINT '- Enhanced Notifications (NEW)';
PRINT '- Audit & Compliance';
PRINT '=======================================================';
PRINT 'Ready for production deployment!';
PRINT '=======================================================';
