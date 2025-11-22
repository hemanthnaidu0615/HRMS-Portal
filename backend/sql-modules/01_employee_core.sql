-- =====================================================
-- EMPLOYEE CORE MODULE
-- Slim, essential employee table with clear field categorization
-- =====================================================

-- ===========================================
-- FIELD CATEGORIZATION LEGEND:
-- ===========================================
-- [REQUIRED_ONBOARDING] - Must be filled to create employee record
-- [REQUIRED_WEEK1]      - Must be completed within first week
-- [REQUIRED_PAYROLL]    - Must be completed before first payroll
-- [OPTIONAL]            - Can be filled anytime, not mandatory
-- [SYSTEM]              - Auto-generated, not user-editable
-- ===========================================

CREATE TABLE employees (
    -- ========================================
    -- SYSTEM FIELDS (Auto-generated)
    -- ========================================
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_code VARCHAR(50) NOT NULL UNIQUE,  -- [SYSTEM] Auto-generated: EMP001, IT002, etc.

    -- ========================================
    -- RELATIONSHIPS
    -- ========================================
    user_id UNIQUEIDENTIFIER NOT NULL UNIQUE,           -- [SYSTEM] Link to users table
    organization_id UNIQUEIDENTIFIER NOT NULL,          -- [SYSTEM] Multi-tenant support
    department_id UNIQUEIDENTIFIER NULL,                -- [REQUIRED_ONBOARDING] Department assignment
    position_id UNIQUEIDENTIFIER NULL,                  -- [REQUIRED_ONBOARDING] Job position
    reports_to UNIQUEIDENTIFIER NULL,                   -- [REQUIRED_WEEK1] Reporting manager

    -- ========================================
    -- STEP 1: BASIC INFO (Required at Onboarding)
    -- Minimum fields to create employee record
    -- ========================================
    first_name VARCHAR(100) NOT NULL,                   -- [REQUIRED_ONBOARDING]
    last_name VARCHAR(100) NOT NULL,                    -- [REQUIRED_ONBOARDING]
    work_email VARCHAR(255) NOT NULL UNIQUE,            -- [REQUIRED_ONBOARDING] Company email
    joining_date DATE NOT NULL,                         -- [REQUIRED_ONBOARDING]
    employment_type VARCHAR(50) NOT NULL DEFAULT 'full_time', -- [REQUIRED_ONBOARDING]

    -- ========================================
    -- STEP 2: PERSONAL DETAILS (Within first week)
    -- ========================================
    middle_name VARCHAR(100),                           -- [OPTIONAL]
    preferred_name VARCHAR(100),                        -- [OPTIONAL] Nickname/preferred name
    personal_email VARCHAR(255),                        -- [REQUIRED_WEEK1] For password reset, etc.
    phone_number VARCHAR(50),                           -- [REQUIRED_WEEK1]
    date_of_birth DATE,                                 -- [REQUIRED_WEEK1] For benefits
    gender VARCHAR(20),                                 -- [OPTIONAL] male/female/non_binary/prefer_not_to_say
    pronouns VARCHAR(50),                               -- [OPTIONAL] he/him, she/her, they/them, etc.
    nationality VARCHAR(100),                           -- [REQUIRED_WEEK1]

    -- ========================================
    -- EMPLOYMENT DETAILS
    -- ========================================
    employment_status VARCHAR(50) NOT NULL DEFAULT 'active',
    work_location VARCHAR(255),                         -- [REQUIRED_ONBOARDING] Office location
    work_arrangement VARCHAR(50) DEFAULT 'onsite',      -- [REQUIRED_ONBOARDING] onsite/remote/hybrid
    time_zone VARCHAR(100),                             -- [REQUIRED_ONBOARDING] Employee's timezone
    designation VARCHAR(255),                           -- [REQUIRED_ONBOARDING] Job title
    grade VARCHAR(50),                                  -- [OPTIONAL] Pay grade
    level VARCHAR(50),                                  -- [OPTIONAL] Seniority level

    -- Vendor/Client (for contractors only)
    vendor_id UNIQUEIDENTIFIER NULL,                    -- [CONDITIONAL] If employment_type = contractor
    client_id UNIQUEIDENTIFIER NULL,                    -- [CONDITIONAL]
    project_id UNIQUEIDENTIFIER NULL,                   -- [CONDITIONAL]

    -- Contract dates
    contract_start_date DATE,                           -- [CONDITIONAL] For contractors
    contract_end_date DATE,                             -- [CONDITIONAL]

    -- Probation
    probation_end_date DATE,                            -- [OPTIONAL] Calculated from joining_date
    is_on_probation BIT DEFAULT 1,                      -- [SYSTEM]

    -- Confirmation
    confirmation_date DATE,                             -- [SYSTEM] When probation completed
    original_hire_date DATE,                            -- [OPTIONAL] If rehired

    -- Notice period
    notice_period_days INT DEFAULT 30,                  -- [REQUIRED_ONBOARDING]

    -- ========================================
    -- PROFILE & SOCIAL (Optional)
    -- ========================================
    profile_photo_url VARCHAR(500),                     -- [OPTIONAL]
    linkedin_profile VARCHAR(255),                      -- [OPTIONAL]
    github_profile VARCHAR(255),                        -- [OPTIONAL]
    personal_website VARCHAR(255),                      -- [OPTIONAL]

    -- ========================================
    -- SKILLS & PREFERENCES (Optional)
    -- ========================================
    skills TEXT,                                        -- [OPTIONAL] JSON array
    certifications TEXT,                                -- [OPTIONAL] JSON array
    languages_spoken TEXT,                              -- [OPTIONAL] JSON array with proficiency
    bio VARCHAR(1000),                                  -- [OPTIONAL] Short bio

    -- Workplace preferences (for events, swag, etc.)
    tshirt_size VARCHAR(10),                            -- [OPTIONAL] XS, S, M, L, XL, XXL, XXXL
    dietary_preferences VARCHAR(255),                   -- [OPTIONAL] Vegetarian, Vegan, Halal, Kosher, None

    -- ========================================
    -- EXIT INFORMATION (Filled on termination)
    -- ========================================
    resignation_date DATE,
    resignation_accepted_date DATE,
    last_working_date DATE,
    exit_type VARCHAR(50),                              -- resignation, termination, retirement, contract_end
    exit_reason VARCHAR(100),                           -- personal, better_opportunity, relocation, etc.
    exit_notes VARCHAR(2000),
    exit_interview_completed BIT DEFAULT 0,
    is_rehire_eligible BIT DEFAULT 1,
    notice_period_served BIT,

    -- ========================================
    -- ONBOARDING TRACKING
    -- ========================================
    onboarding_status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed
    onboarding_completed_at DATETIME2,
    onboarding_completed_by UNIQUEIDENTIFIER,

    -- ========================================
    -- AUDIT FIELDS
    -- ========================================
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,
    deleted_by UNIQUEIDENTIFIER,

    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
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

    -- ========================================
    -- CONSTRAINTS
    -- ========================================
    CONSTRAINT chk_emp_employment_type CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'consultant', 'intern', 'temporary')),
    CONSTRAINT chk_emp_employment_status CHECK (employment_status IN ('active', 'on_notice', 'resigned', 'terminated', 'on_leave', 'suspended')),
    CONSTRAINT chk_emp_work_arrangement CHECK (work_arrangement IN ('onsite', 'remote', 'hybrid')),
    CONSTRAINT chk_emp_gender CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say') OR gender IS NULL),
    CONSTRAINT chk_emp_onboarding_status CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed'))
);

-- ========================================
-- INDEXES
-- ========================================
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
