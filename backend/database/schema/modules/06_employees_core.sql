-- =====================================================
-- MODULE: EMPLOYEES CORE
-- Order: 06 (Depends on: 01, 02, 03, 04, 05)
-- Description: Core employee entity
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 6 of 16
-- =====================================================
-- FIELD CATEGORIZATION:
-- [REQUIRED_ONBOARDING] - Must fill to create employee
-- [REQUIRED_WEEK1]      - Complete within first week
-- [REQUIRED_PAYROLL]    - Complete before first payroll
-- [OPTIONAL]            - Anytime, not mandatory
-- [SYSTEM]              - Auto-generated
-- =====================================================

CREATE TABLE employees (
    -- SYSTEM FIELDS [SYSTEM]
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_code VARCHAR(50) NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    department_id UNIQUEIDENTIFIER,
    position_id UNIQUEIDENTIFIER,
    reports_to UNIQUEIDENTIFIER,
    work_location_id UNIQUEIDENTIFIER,
    job_grade_id UNIQUEIDENTIFIER,

    -- BASIC INFO [REQUIRED_ONBOARDING]
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    work_email VARCHAR(255) NOT NULL,
    joining_date DATE NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'full_time',

    -- PERSONAL DETAILS [REQUIRED_WEEK1]
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

    -- CONTRACTOR DETAILS (for contractors)
    vendor_id UNIQUEIDENTIFIER,
    client_id UNIQUEIDENTIFIER,
    project_id UNIQUEIDENTIFIER,
    contract_start_date DATE,
    contract_end_date DATE,
    contract_billing_rate DECIMAL(10,2),
    contract_billing_currency VARCHAR(10),

    -- PROBATION
    probation_end_date DATE,
    is_on_probation BIT DEFAULT 1,
    confirmation_date DATE,
    original_hire_date DATE,

    -- NOTICE PERIOD
    notice_period_days INT DEFAULT 30 CHECK (notice_period_days >= 0),

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
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,
    deleted_by UNIQUEIDENTIFIER,

    -- FOREIGN KEYS
    CONSTRAINT FK_emp_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_emp_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_emp_dept FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT FK_emp_pos FOREIGN KEY (position_id) REFERENCES positions(id),
    CONSTRAINT FK_emp_reports_to FOREIGN KEY (reports_to) REFERENCES employees(id),
    CONSTRAINT FK_emp_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    CONSTRAINT FK_emp_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT FK_emp_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT FK_emp_location FOREIGN KEY (work_location_id) REFERENCES work_locations(id),
    CONSTRAINT FK_emp_grade FOREIGN KEY (job_grade_id) REFERENCES job_grades(id),
    CONSTRAINT FK_emp_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_emp_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT FK_emp_onb_completed_by FOREIGN KEY (onboarding_completed_by) REFERENCES users(id),

    -- UNIQUE CONSTRAINTS
    CONSTRAINT UQ_emp_code UNIQUE (employee_code),
    CONSTRAINT UQ_emp_user UNIQUE (user_id),
    CONSTRAINT UQ_emp_work_email UNIQUE (work_email),

    -- CHECK CONSTRAINTS
    CONSTRAINT chk_emp_employment_type CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'consultant', 'intern', 'temporary')),
    CONSTRAINT chk_emp_employment_status CHECK (employment_status IN ('active', 'on_notice', 'resigned', 'terminated', 'on_leave', 'suspended', 'probation')),
    CONSTRAINT chk_emp_work_arrangement CHECK (work_arrangement IN ('onsite', 'remote', 'hybrid') OR work_arrangement IS NULL),
    CONSTRAINT chk_emp_gender CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say') OR gender IS NULL),
    CONSTRAINT chk_emp_marital_status CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated', 'domestic_partnership') OR marital_status IS NULL),
    CONSTRAINT chk_emp_onboarding_status CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
    CONSTRAINT chk_emp_exit_type CHECK (exit_type IN ('resignation', 'termination', 'retirement', 'contract_end', 'mutual_separation', 'death', 'absconding') OR exit_type IS NULL),
    CONSTRAINT chk_emp_email CHECK (work_email LIKE '%_@__%.__%'),
    CONSTRAINT chk_emp_dob CHECK (date_of_birth IS NULL OR date_of_birth < CAST(GETDATE() AS DATE))
);

-- =====================================================
-- TABLE: employee_code_sequences
-- Auto-generate employee codes
-- =====================================================
CREATE TABLE employee_code_sequences (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    department_id UNIQUEIDENTIFIER,
    prefix VARCHAR(20) NOT NULL,
    current_number INT NOT NULL DEFAULT 0,
    padding_length INT NOT NULL DEFAULT 4,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    CONSTRAINT FK_ecs_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_ecs_dept FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT UQ_ecs_org_dept UNIQUE (organization_id, department_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_emp_org ON employees(organization_id);
CREATE INDEX idx_emp_dept ON employees(department_id);
CREATE INDEX idx_emp_pos ON employees(position_id);
CREATE INDEX idx_emp_reports_to ON employees(reports_to);
CREATE INDEX idx_emp_user ON employees(user_id);
CREATE INDEX idx_emp_code ON employees(employee_code);
CREATE INDEX idx_emp_work_email ON employees(work_email);
CREATE INDEX idx_emp_status ON employees(employment_status);
CREATE INDEX idx_emp_type ON employees(employment_type);
CREATE INDEX idx_emp_joining ON employees(joining_date DESC);
CREATE INDEX idx_emp_onboarding ON employees(onboarding_status);
CREATE INDEX idx_emp_vendor ON employees(vendor_id);
CREATE INDEX idx_emp_client ON employees(client_id);
CREATE INDEX idx_emp_active ON employees(organization_id, employment_status) WHERE deleted_at IS NULL;

-- Add circular FK for department head
ALTER TABLE departments ADD CONSTRAINT FK_depts_head FOREIGN KEY (head_employee_id) REFERENCES employees(id);

-- Add circular FK for client account manager
ALTER TABLE clients ADD CONSTRAINT FK_clients_account_mgr FOREIGN KEY (account_manager_id) REFERENCES employees(id);

-- Add circular FK for project manager
ALTER TABLE projects ADD CONSTRAINT FK_projects_pm FOREIGN KEY (project_manager_id) REFERENCES employees(id);

-- Add circular FK for task assignment
ALTER TABLE project_tasks ADD CONSTRAINT FK_tasks_assigned FOREIGN KEY (assigned_to_id) REFERENCES employees(id);

PRINT 'Module 06: Employees Core - Created Successfully';
