-- =====================================================
-- HRMS PORTAL - COMPLETE DATABASE SCHEMA v2.0
-- Multi-tenant SaaS with flexible role-based permissions
-- REDESIGNED WITH MODULAR, COUNTRY-AGNOSTIC ARCHITECTURE
-- =====================================================
--
-- KEY IMPROVEMENTS IN v2.0:
-- 1. Country-agnostic identity document storage
-- 2. Modular employee data (addresses, contacts, bank accounts)
-- 3. Clear field categorization (required vs optional)
-- 4. Onboarding progress tracking
-- 5. Support for any country's tax/ID requirements
-- =====================================================

-- =====================================================
-- SECTION 1: CORE FOUNDATION TABLES
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
    country VARCHAR(100) DEFAULT 'United States',
    country_code VARCHAR(3) DEFAULT 'USA',
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
-- SECTION 2: ROLE & PERMISSION SYSTEM
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
-- SECTION 3: ORGANIZATION STRUCTURE
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
-- SECTION 4: VENDOR MANAGEMENT
-- =====================================================

CREATE TABLE vendors (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    name VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    vendor_type VARCHAR(50) NOT NULL,
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    business_registration_number VARCHAR(100),
    website VARCHAR(255),
    contract_start_date DATE,
    contract_end_date DATE,
    contract_status VARCHAR(50) NOT NULL DEFAULT 'active',
    contract_document_id UNIQUEIDENTIFIER,
    billing_type VARCHAR(50) NOT NULL,
    default_billing_rate DECIMAL(10,2),
    billing_currency VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100),
    parent_vendor_id UNIQUEIDENTIFIER NULL,
    tier_level INT DEFAULT 1,
    performance_rating DECIMAL(3,2),
    total_resources_supplied INT DEFAULT 0,
    active_resources_count INT DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    is_preferred BIT NOT NULL DEFAULT 0,
    blacklisted BIT NOT NULL DEFAULT 0,
    blacklist_reason VARCHAR(500),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- SECTION 5: CLIENT MANAGEMENT
-- =====================================================

CREATE TABLE clients (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    name VARCHAR(255) NOT NULL,
    client_code VARCHAR(50) UNIQUE NOT NULL,
    client_type VARCHAR(50) NOT NULL,
    industry VARCHAR(100),
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    website VARCHAR(255),
    relationship_start_date DATE,
    relationship_status VARCHAR(50) NOT NULL DEFAULT 'active',
    account_manager_id UNIQUEIDENTIFIER,
    total_active_projects INT DEFAULT 0,
    total_active_resources INT DEFAULT 0,
    lifetime_revenue DECIMAL(15,2) DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    is_strategic BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- SECTION 6: PROJECTS
-- =====================================================

CREATE TABLE projects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    client_id UNIQUEIDENTIFIER NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_type VARCHAR(50),
    description VARCHAR(2000),
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_duration_months INT,
    project_status VARCHAR(50) NOT NULL DEFAULT 'active',
    project_budget DECIMAL(15,2),
    billing_rate_type VARCHAR(50),
    default_billing_rate DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    project_manager_id UNIQUEIDENTIFIER,
    total_allocated_resources INT DEFAULT 0,
    total_hours_logged DECIMAL(10,2) DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    is_billable BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- SECTION 7: EMPLOYEE CORE (REDESIGNED v2.0)
-- =====================================================
-- Field Categorization:
-- [REQUIRED_ONBOARDING] - Must fill to create employee
-- [REQUIRED_WEEK1]      - Complete within first week
-- [REQUIRED_PAYROLL]    - Complete before first payroll
-- [OPTIONAL]            - Anytime, not mandatory
-- [SYSTEM]              - Auto-generated
-- =====================================================

CREATE TABLE employees (
    -- SYSTEM FIELDS
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    user_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    department_id UNIQUEIDENTIFIER NULL,
    position_id UNIQUEIDENTIFIER NULL,
    reports_to UNIQUEIDENTIFIER NULL,

    -- STEP 1: BASIC INFO [REQUIRED_ONBOARDING]
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    work_email VARCHAR(255) NOT NULL UNIQUE,
    joining_date DATE NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'full_time',

    -- STEP 2: PERSONAL DETAILS [REQUIRED_WEEK1]
    middle_name VARCHAR(100),
    preferred_name VARCHAR(100),
    personal_email VARCHAR(255),
    phone_number VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20),
    pronouns VARCHAR(50),
    nationality VARCHAR(100),
    marital_status VARCHAR(20),
    blood_group VARCHAR(10),

    -- EMPLOYMENT DETAILS
    employment_status VARCHAR(50) NOT NULL DEFAULT 'active',
    work_location VARCHAR(255),
    work_arrangement VARCHAR(50) DEFAULT 'onsite',
    time_zone VARCHAR(100),
    designation VARCHAR(255),
    grade VARCHAR(50),
    level VARCHAR(50),

    -- Vendor/Client (for contractors)
    vendor_id UNIQUEIDENTIFIER NULL,
    client_id UNIQUEIDENTIFIER NULL,
    project_id UNIQUEIDENTIFIER NULL,
    contract_start_date DATE,
    contract_end_date DATE,

    -- Probation
    probation_end_date DATE,
    is_on_probation BIT DEFAULT 1,
    confirmation_date DATE,
    original_hire_date DATE,

    -- Notice period
    notice_period_days INT DEFAULT 30,

    -- PROFILE & SOCIAL [OPTIONAL]
    profile_photo_url VARCHAR(500),
    linkedin_profile VARCHAR(255),
    github_profile VARCHAR(255),
    personal_website VARCHAR(255),

    -- SKILLS & PREFERENCES [OPTIONAL]
    skills NVARCHAR(MAX),
    certifications NVARCHAR(MAX),
    languages_spoken NVARCHAR(MAX),
    bio VARCHAR(1000),
    tshirt_size VARCHAR(10),
    dietary_preferences VARCHAR(255),

    -- EXIT INFORMATION
    resignation_date DATE,
    resignation_accepted_date DATE,
    last_working_date DATE,
    exit_type VARCHAR(50),
    exit_reason VARCHAR(100),
    exit_notes VARCHAR(2000),
    exit_interview_completed BIT DEFAULT 0,
    is_rehire_eligible BIT DEFAULT 1,
    notice_period_served BIT,

    -- ONBOARDING TRACKING
    onboarding_status VARCHAR(50) DEFAULT 'not_started',
    onboarding_completed_at DATETIME2,
    onboarding_completed_by UNIQUEIDENTIFIER,

    -- AUDIT FIELDS
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,
    deleted_by UNIQUEIDENTIFIER,

    -- FOREIGN KEYS
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
    FOREIGN KEY (onboarding_completed_by) REFERENCES users(id),

    -- CONSTRAINTS
    CONSTRAINT chk_emp_employment_type CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'consultant', 'intern', 'temporary')),
    CONSTRAINT chk_emp_employment_status CHECK (employment_status IN ('active', 'on_notice', 'resigned', 'terminated', 'on_leave', 'suspended')),
    CONSTRAINT chk_emp_work_arrangement CHECK (work_arrangement IN ('onsite', 'remote', 'hybrid') OR work_arrangement IS NULL),
    CONSTRAINT chk_emp_gender CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say') OR gender IS NULL),
    CONSTRAINT chk_emp_onboarding_status CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed'))
);

-- Employee Indexes
CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_employees_dept ON employees(department_id);
CREATE INDEX idx_employees_reports_to ON employees(reports_to);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_work_email ON employees(work_email);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_type ON employees(employment_type);
CREATE INDEX idx_employees_joining ON employees(joining_date DESC);
CREATE INDEX idx_employees_onboarding ON employees(onboarding_status);
CREATE INDEX idx_employees_vendor ON employees(vendor_id);
CREATE INDEX idx_employees_client ON employees(client_id);

-- =====================================================
-- SECTION 8: EMPLOYEE ADDRESSES
-- =====================================================

CREATE TABLE employee_addresses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    address_type VARCHAR(50) NOT NULL,
    is_primary BIT DEFAULT 0,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    address_line3 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'United States',
    country_code VARCHAR(3),
    is_verified BIT DEFAULT 0,
    verified_at DATETIME2,
    verified_by UNIQUEIDENTIFIER,
    proof_document_id UNIQUEIDENTIFIER,
    effective_from DATE,
    effective_to DATE,
    is_current BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT chk_addr_type CHECK (address_type IN ('current', 'permanent', 'mailing', 'work', 'temporary'))
);

CREATE UNIQUE INDEX idx_employee_primary_address ON employee_addresses(employee_id) WHERE is_primary = 1 AND is_current = 1;
CREATE INDEX idx_emp_addr_employee ON employee_addresses(employee_id);
CREATE INDEX idx_emp_addr_type ON employee_addresses(address_type);

-- =====================================================
-- SECTION 9: EMPLOYEE EMERGENCY CONTACTS
-- =====================================================

CREATE TABLE employee_emergency_contacts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    priority INT NOT NULL DEFAULT 1,
    is_primary BIT DEFAULT 0,
    contact_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    primary_phone VARCHAR(50) NOT NULL,
    secondary_phone VARCHAR(50),
    phone_country_code VARCHAR(5),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    notes VARCHAR(500),
    best_time_to_contact VARCHAR(100),
    speaks_languages VARCHAR(255),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT chk_ec_relationship CHECK (relationship IN (
        'spouse', 'partner', 'parent', 'mother', 'father',
        'sibling', 'brother', 'sister', 'child', 'son', 'daughter',
        'grandparent', 'uncle', 'aunt', 'cousin', 'nephew', 'niece',
        'friend', 'colleague', 'neighbor', 'guardian', 'other'
    ))
);

CREATE UNIQUE INDEX idx_employee_primary_emergency ON employee_emergency_contacts(employee_id) WHERE is_primary = 1;
CREATE INDEX idx_emp_ec_employee ON employee_emergency_contacts(employee_id);

-- =====================================================
-- SECTION 10: IDENTITY DOCUMENT TYPES (Reference)
-- Country-Agnostic Design
-- =====================================================

CREATE TABLE identity_document_types (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NULL,
    document_type_code VARCHAR(50) NOT NULL,
    document_type_name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    country_code VARCHAR(3),
    country_name VARCHAR(100),
    format_regex VARCHAR(255),
    format_example VARCHAR(100),
    max_length INT,
    min_length INT,
    is_required_for_payroll BIT DEFAULT 0,
    is_required_for_tax BIT DEFAULT 0,
    is_required_for_work_auth BIT DEFAULT 0,
    is_government_issued BIT DEFAULT 1,
    has_expiry_date BIT DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    is_active BIT DEFAULT 1,
    is_system_type BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT chk_idt_category CHECK (category IN ('tax_id', 'national_id', 'work_auth', 'driving', 'passport', 'visa', 'other'))
);

-- SEED: USA Identity Documents
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('SSN', 'Social Security Number', 'USA', 'United States', '^\d{3}-?\d{2}-?\d{4}$', 'XXX-XX-XXXX', 'tax_id', 1, 1, 0),
('ITIN', 'Individual Taxpayer Identification Number', 'USA', 'United States', '^\d{3}-?\d{2}-?\d{4}$', '9XX-XX-XXXX', 'tax_id', 1, 1, 0),
('DL_USA', 'Driver''s License (US)', 'USA', 'United States', NULL, 'Varies by state', 'driving', 0, 0, 1),
('EAD', 'Employment Authorization Document', 'USA', 'United States', NULL, 'XXX-XXX-XXXXX', 'work_auth', 0, 0, 1),
('GREEN_CARD', 'Permanent Resident Card', 'USA', 'United States', NULL, 'XXX-XXX-XXXXX', 'work_auth', 0, 0, 1);

-- SEED: India Identity Documents
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('PAN', 'Permanent Account Number', 'IND', 'India', '^[A-Z]{5}[0-9]{4}[A-Z]$', 'ABCDE1234F', 'tax_id', 1, 1, 0),
('AADHAAR', 'Aadhaar Number', 'IND', 'India', '^\d{4}\s?\d{4}\s?\d{4}$', 'XXXX XXXX XXXX', 'national_id', 1, 0, 0),
('UAN', 'Universal Account Number (PF)', 'IND', 'India', '^\d{12}$', 'XXXXXXXXXXXX', 'tax_id', 1, 0, 0),
('DL_IND', 'Driver''s License (India)', 'IND', 'India', NULL, 'XX00 00000000000', 'driving', 0, 0, 1),
('VOTER_ID', 'Voter ID Card', 'IND', 'India', '^[A-Z]{3}[0-9]{7}$', 'ABC1234567', 'national_id', 0, 0, 0);

-- SEED: UK Identity Documents
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('NI_NUMBER', 'National Insurance Number', 'GBR', 'United Kingdom', '^[A-Z]{2}[0-9]{6}[A-Z]$', 'AB123456C', 'tax_id', 1, 1, 0),
('BRP', 'Biometric Residence Permit', 'GBR', 'United Kingdom', NULL, 'XXXXXXXXX', 'work_auth', 0, 0, 1),
('DL_UK', 'Driver''s License (UK)', 'GBR', 'United Kingdom', NULL, 'XXXXX000000XX0XX', 'driving', 0, 0, 1);

-- SEED: Canada Identity Documents
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('SIN', 'Social Insurance Number', 'CAN', 'Canada', '^\d{3}-?\d{3}-?\d{3}$', 'XXX-XXX-XXX', 'tax_id', 1, 1, 0),
('PR_CARD', 'Permanent Resident Card', 'CAN', 'Canada', NULL, 'XXXXXXXXX', 'work_auth', 0, 0, 1);

-- SEED: Australia Identity Documents
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('TFN', 'Tax File Number', 'AUS', 'Australia', '^\d{8,9}$', 'XXX XXX XXX', 'tax_id', 1, 1, 0),
('ABN', 'Australian Business Number', 'AUS', 'Australia', '^\d{11}$', 'XX XXX XXX XXX', 'tax_id', 0, 1, 0);

-- SEED: Germany Identity Documents
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('STEUER_ID', 'Tax Identification Number (Steuer-ID)', 'DEU', 'Germany', '^\d{11}$', 'XXXXXXXXXXX', 'tax_id', 1, 1, 0),
('SOZIAL', 'Social Security Number', 'DEU', 'Germany', NULL, 'XX XXXXXX X XXX', 'tax_id', 1, 0, 0);

-- SEED: Universal Documents
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('PASSPORT', 'Passport', NULL, NULL, NULL, 'Varies', 'passport', 0, 0, 1),
('WORK_VISA', 'Work Visa', NULL, NULL, NULL, 'Varies', 'visa', 0, 0, 1),
('WORK_PERMIT', 'Work Permit', NULL, NULL, NULL, 'Varies', 'work_auth', 0, 0, 1);

-- =====================================================
-- SECTION 11: EMPLOYEE IDENTITY DOCUMENTS
-- =====================================================

CREATE TABLE employee_identity_documents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    document_type_id UNIQUEIDENTIFIER NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    document_number_masked VARCHAR(20),
    issuing_authority VARCHAR(255),
    issuing_country VARCHAR(100),
    issuing_state VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_at DATETIME2,
    verified_by UNIQUEIDENTIFIER,
    verification_notes VARCHAR(500),
    rejection_reason VARCHAR(500),
    document_file_id UNIQUEIDENTIFIER,
    document_front_url VARCHAR(500),
    document_back_url VARCHAR(500),
    is_primary_tax_id BIT DEFAULT 0,
    is_work_authorization BIT DEFAULT 0,
    used_for_i9 BIT DEFAULT 0,
    expiry_reminder_sent BIT DEFAULT 0,
    expiry_reminder_date DATETIME2,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (document_type_id) REFERENCES identity_document_types(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT chk_eid_status CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired', 'needs_update'))
);

CREATE UNIQUE INDEX idx_emp_primary_tax_id ON employee_identity_documents(employee_id, issuing_country) WHERE is_primary_tax_id = 1;
CREATE INDEX idx_emp_id_docs_employee ON employee_identity_documents(employee_id);
CREATE INDEX idx_emp_id_docs_type ON employee_identity_documents(document_type_id);
CREATE INDEX idx_emp_id_docs_status ON employee_identity_documents(verification_status);
CREATE INDEX idx_emp_id_docs_expiry ON employee_identity_documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- =====================================================
-- SECTION 12: EMPLOYEE BANK ACCOUNTS
-- =====================================================

CREATE TABLE employee_bank_accounts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    account_purpose VARCHAR(50) NOT NULL DEFAULT 'salary',
    is_primary BIT DEFAULT 0,
    priority INT DEFAULT 1,
    bank_name VARCHAR(255) NOT NULL,
    bank_branch VARCHAR(255),
    bank_address VARCHAR(500),
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_number_masked VARCHAR(20),
    account_type VARCHAR(50) DEFAULT 'checking',
    swift_code VARCHAR(11),
    iban VARCHAR(34),
    routing_number VARCHAR(20),
    ifsc_code VARCHAR(15),
    sort_code VARCHAR(10),
    bsb_code VARCHAR(10),
    transit_number VARCHAR(10),
    institution_number VARCHAR(5),
    clabe VARCHAR(20),
    bank_country VARCHAR(100) NOT NULL DEFAULT 'United States',
    bank_country_code VARCHAR(3),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_at DATETIME2,
    verified_by UNIQUEIDENTIFIER,
    verification_method VARCHAR(50),
    verification_notes VARCHAR(500),
    proof_document_id UNIQUEIDENTIFIER,
    split_type VARCHAR(20),
    split_value DECIMAL(10,2),
    is_active BIT DEFAULT 1,
    deactivated_at DATETIME2,
    deactivation_reason VARCHAR(255),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT chk_ba_purpose CHECK (account_purpose IN ('salary', 'reimbursement', 'bonus', 'all')),
    CONSTRAINT chk_ba_type CHECK (account_type IN ('checking', 'savings', 'current', 'salary')),
    CONSTRAINT chk_ba_status CHECK (verification_status IN ('pending', 'verified', 'failed', 'needs_update'))
);

CREATE UNIQUE INDEX idx_emp_primary_bank ON employee_bank_accounts(employee_id) WHERE is_primary = 1 AND is_active = 1 AND account_purpose = 'salary';
CREATE INDEX idx_emp_bank_employee ON employee_bank_accounts(employee_id);
CREATE INDEX idx_emp_bank_status ON employee_bank_accounts(verification_status);

-- =====================================================
-- SECTION 13: EMPLOYEE TAX INFORMATION
-- =====================================================

CREATE TABLE employee_tax_info (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    tax_country VARCHAR(100) NOT NULL,
    tax_country_code VARCHAR(3) NOT NULL,
    tax_year INT NOT NULL,
    tax_residency_status VARCHAR(50),
    is_tax_resident BIT DEFAULT 1,
    residency_start_date DATE,

    -- US-Specific
    us_filing_status VARCHAR(50),
    us_allowances INT,
    us_additional_withholding DECIMAL(10,2),
    us_exempt_from_withholding BIT DEFAULT 0,
    us_w4_submitted BIT DEFAULT 0,
    us_w4_submitted_date DATE,
    us_state_code VARCHAR(5),
    us_state_filing_status VARCHAR(50),
    us_state_allowances INT,
    us_local_tax_code VARCHAR(50),

    -- UK-Specific
    uk_tax_code VARCHAR(20),
    uk_is_cumulative BIT DEFAULT 1,
    uk_starter_declaration VARCHAR(5),
    uk_student_loan_plan VARCHAR(10),

    -- India-Specific
    ind_tax_regime VARCHAR(20),
    ind_hra_exemption_applicable BIT DEFAULT 0,
    ind_section_80c_declared DECIMAL(12,2),
    ind_section_80d_declared DECIMAL(12,2),
    ind_other_deductions DECIMAL(12,2),
    ind_total_investment_declaration DECIMAL(12,2),

    -- Canada-Specific
    can_province_code VARCHAR(5),
    can_td1_federal_submitted BIT DEFAULT 0,
    can_td1_provincial_submitted BIT DEFAULT 0,
    can_total_claim_amount DECIMAL(12,2),

    -- Australia-Specific
    aus_tax_free_threshold BIT DEFAULT 1,
    aus_help_debt BIT DEFAULT 0,
    aus_sfss_debt BIT DEFAULT 0,

    -- Generic
    tax_bracket VARCHAR(50),
    estimated_annual_tax DECIMAL(12,2),
    year_to_date_tax_paid DECIMAL(12,2),
    annual_declaration_submitted BIT DEFAULT 0,
    declaration_submitted_date DATE,
    declaration_document_id UNIQUEIDENTIFIER,
    custom_tax_data NVARCHAR(MAX),
    is_current BIT DEFAULT 1,
    is_verified BIT DEFAULT 0,
    verified_by UNIQUEIDENTIFIER,
    verified_at DATETIME2,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT chk_ti_residency CHECK (tax_residency_status IN ('resident', 'non_resident', 'dual_status') OR tax_residency_status IS NULL),
    CONSTRAINT chk_ti_us_filing CHECK (us_filing_status IN ('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow') OR us_filing_status IS NULL)
);

CREATE UNIQUE INDEX idx_emp_tax_unique ON employee_tax_info(employee_id, tax_country_code, tax_year) WHERE is_current = 1;
CREATE INDEX idx_emp_tax_employee ON employee_tax_info(employee_id);
CREATE INDEX idx_emp_tax_country ON employee_tax_info(tax_country_code);
CREATE INDEX idx_emp_tax_year ON employee_tax_info(tax_year);

-- =====================================================
-- SECTION 14: EMPLOYEE ONBOARDING
-- =====================================================

CREATE TABLE onboarding_templates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    employment_type VARCHAR(50),
    department_id UNIQUEIDENTIFIER,
    country_code VARCHAR(3),
    is_active BIT DEFAULT 1,
    is_default BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE onboarding_template_steps (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    template_id UNIQUEIDENTIFIER NOT NULL,
    step_number INT NOT NULL,
    step_code VARCHAR(50) NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_description VARCHAR(1000),
    category VARCHAR(50) NOT NULL,
    due_by_days INT,
    reminder_before_days INT,
    depends_on_step_id UNIQUEIDENTIFIER,
    assigned_to VARCHAR(50) DEFAULT 'employee',
    can_be_skipped BIT DEFAULT 0,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BIT DEFAULT 1,
    FOREIGN KEY (template_id) REFERENCES onboarding_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_step_id) REFERENCES onboarding_template_steps(id),
    CONSTRAINT chk_ots_category CHECK (category IN ('required_onboarding', 'required_week1', 'required_payroll', 'optional')),
    CONSTRAINT chk_ots_assigned CHECK (assigned_to IN ('employee', 'hr', 'manager', 'it', 'finance', 'admin'))
);

CREATE TABLE onboarding_checklist_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    step_id UNIQUEIDENTIFIER NOT NULL,
    item_order INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description VARCHAR(500),
    item_type VARCHAR(50) NOT NULL,
    related_field VARCHAR(100),
    related_table VARCHAR(100),
    required_document_type VARCHAR(50),
    acknowledgement_text VARCHAR(2000),
    is_required BIT DEFAULT 1,
    validation_rule VARCHAR(500),
    help_text VARCHAR(500),
    example_text VARCHAR(255),
    FOREIGN KEY (step_id) REFERENCES onboarding_template_steps(id) ON DELETE CASCADE,
    CONSTRAINT chk_oci_type CHECK (item_type IN ('form_field', 'document_upload', 'acknowledgement', 'task', 'verification', 'info'))
);

CREATE TABLE employee_onboarding_progress (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    template_id UNIQUEIDENTIFIER NOT NULL,
    overall_status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    overall_percentage INT DEFAULT 0,
    started_at DATETIME2,
    target_completion_date DATE,
    completed_at DATETIME2,
    hr_assignee_id UNIQUEIDENTIFIER,
    buddy_id UNIQUEIDENTIFIER,
    steps_progress NVARCHAR(MAX),
    total_steps INT DEFAULT 0,
    completed_steps INT DEFAULT 0,
    pending_steps INT DEFAULT 0,
    overdue_steps INT DEFAULT 0,
    hr_notes VARCHAR(2000),
    employee_feedback VARCHAR(2000),
    feedback_rating INT,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (template_id) REFERENCES onboarding_templates(id),
    FOREIGN KEY (hr_assignee_id) REFERENCES employees(id),
    FOREIGN KEY (buddy_id) REFERENCES employees(id),
    CONSTRAINT chk_eop_status CHECK (overall_status IN ('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'))
);

CREATE TABLE employee_onboarding_step_status (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    onboarding_progress_id UNIQUEIDENTIFIER NOT NULL,
    step_id UNIQUEIDENTIFIER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    percentage INT DEFAULT 0,
    started_at DATETIME2,
    completed_at DATETIME2,
    due_date DATE,
    is_overdue BIT DEFAULT 0,
    completed_by UNIQUEIDENTIFIER,
    completion_notes VARCHAR(500),
    blocked_reason VARCHAR(500),
    blocked_by_step_id UNIQUEIDENTIFIER,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    FOREIGN KEY (onboarding_progress_id) REFERENCES employee_onboarding_progress(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES onboarding_template_steps(id),
    FOREIGN KEY (completed_by) REFERENCES users(id),
    FOREIGN KEY (blocked_by_step_id) REFERENCES onboarding_template_steps(id),
    CONSTRAINT chk_eoss_status CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked'))
);

-- Onboarding Indexes
CREATE INDEX idx_onb_templates_org ON onboarding_templates(organization_id);
CREATE INDEX idx_emp_onb_progress_employee ON employee_onboarding_progress(employee_id);
CREATE INDEX idx_emp_onb_progress_status ON employee_onboarding_progress(overall_status);

-- =====================================================
-- SECTION 15: EMPLOYEE HISTORY & AUDIT
-- =====================================================

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

CREATE INDEX idx_employee_history_employee ON employee_history(employee_id);
CREATE INDEX idx_employee_history_date ON employee_history(changed_at DESC);

-- =====================================================
-- SECTION 16: ADD CIRCULAR FOREIGN KEYS
-- =====================================================

ALTER TABLE vendors ADD CONSTRAINT FK_vendors_parent_vendor FOREIGN KEY (parent_vendor_id) REFERENCES vendors(id);
ALTER TABLE clients ADD CONSTRAINT FK_clients_account_manager FOREIGN KEY (account_manager_id) REFERENCES employees(id);
ALTER TABLE projects ADD CONSTRAINT FK_projects_project_manager FOREIGN KEY (project_manager_id) REFERENCES employees(id);

-- =====================================================
-- SECTION 17: DOCUMENT MANAGEMENT
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

CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_status ON documents(approval_status);
CREATE INDEX idx_document_requests_employee ON document_requests(target_employee_id);

-- Add FK for address proof documents
ALTER TABLE employee_addresses ADD CONSTRAINT FK_addr_proof_doc FOREIGN KEY (proof_document_id) REFERENCES documents(id);
ALTER TABLE employee_bank_accounts ADD CONSTRAINT FK_bank_proof_doc FOREIGN KEY (proof_document_id) REFERENCES documents(id);
ALTER TABLE employee_identity_documents ADD CONSTRAINT FK_id_doc_file FOREIGN KEY (document_file_id) REFERENCES documents(id);
ALTER TABLE employee_tax_info ADD CONSTRAINT FK_tax_declaration_doc FOREIGN KEY (declaration_document_id) REFERENCES documents(id);

-- =====================================================
-- SECTION 18: EMPLOYEE CODE SEQUENCE
-- =====================================================

CREATE TABLE employee_code_sequences (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    department_id UNIQUEIDENTIFIER NULL,
    prefix VARCHAR(20) NOT NULL,
    current_number INT NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT unique_dept_sequence UNIQUE (organization_id, department_id)
);

-- =====================================================
-- SECTION 19: AUDIT & LOGGING
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

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at DESC);

-- =====================================================
-- SECTION 20: SEED SYSTEM ROLES
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
-- SECTION 21: SEED PERMISSIONS
-- =====================================================

-- Employee permissions
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

-- Document permissions
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

-- Onboarding permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
('onboarding', 'view', 'own', NULL, 'View own onboarding progress'),
('onboarding', 'view', 'team', NULL, 'View team onboarding'),
('onboarding', 'view', 'organization', NULL, 'View all onboarding'),
('onboarding', 'manage', 'organization', NULL, 'Manage onboarding templates'),
('onboarding', 'complete', 'own', NULL, 'Complete own onboarding tasks');

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

-- Assign permissions to roles
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
-- SCHEMA COMPLETION MESSAGE
-- =====================================================
PRINT '=======================================================';
PRINT 'HRMS PORTAL - SCHEMA v2.0 CREATED SUCCESSFULLY';
PRINT '=======================================================';
PRINT 'New Features:';
PRINT '- Country-agnostic identity documents';
PRINT '- Modular employee data (addresses, contacts, bank)';
PRINT '- Onboarding progress tracking';
PRINT '- Clear required vs optional field separation';
PRINT '- Support for USA, India, UK, Canada, Australia, Germany';
PRINT '=======================================================';
