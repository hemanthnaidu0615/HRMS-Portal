-- =====================================================
-- MODULE: EMPLOYEE CONTACTS
-- Order: 08 (Depends on: 06_employees_core)
-- Description: Emergency contacts
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 8 of 16
-- =====================================================

CREATE TABLE employee_emergency_contacts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Priority & Primary
    priority INT NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    is_primary BIT NOT NULL DEFAULT 0,

    -- Contact Info
    contact_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    primary_phone VARCHAR(50) NOT NULL,
    secondary_phone VARCHAR(50),
    phone_country_code VARCHAR(5) DEFAULT '+1',
    email VARCHAR(255),

    -- Address
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),

    -- Additional
    notes VARCHAR(500),
    best_time_to_contact VARCHAR(100),
    speaks_languages VARCHAR(255),
    is_legal_guardian BIT NOT NULL DEFAULT 0,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    CONSTRAINT FK_ec_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_ec_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_ec_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_ec_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),

    CONSTRAINT chk_ec_relationship CHECK (relationship IN (
        'spouse', 'partner', 'parent', 'mother', 'father',
        'sibling', 'brother', 'sister', 'child', 'son', 'daughter',
        'grandparent', 'uncle', 'aunt', 'cousin', 'nephew', 'niece',
        'friend', 'colleague', 'neighbor', 'guardian', 'other'
    )),
    CONSTRAINT chk_ec_email CHECK (email IS NULL OR email LIKE '%_@__%.__%')
);

-- Only one primary emergency contact per employee
CREATE UNIQUE INDEX idx_emp_primary_ec ON employee_emergency_contacts(employee_id)
    WHERE is_primary = 1;

CREATE INDEX idx_ec_emp ON employee_emergency_contacts(employee_id);
CREATE INDEX idx_ec_priority ON employee_emergency_contacts(employee_id, priority);

-- =====================================================
-- TABLE: employee_dependents
-- Family members for benefits/insurance
-- =====================================================
CREATE TABLE employee_dependents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Basic Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),

    -- Identification
    ssn_last_four VARCHAR(4),
    national_id VARCHAR(100),

    -- Coverage
    is_covered_health BIT NOT NULL DEFAULT 0,
    is_covered_dental BIT NOT NULL DEFAULT 0,
    is_covered_vision BIT NOT NULL DEFAULT 0,
    is_covered_life BIT NOT NULL DEFAULT 0,
    coverage_start_date DATE,
    coverage_end_date DATE,

    -- Status
    is_disabled BIT NOT NULL DEFAULT 0,
    is_student BIT NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    CONSTRAINT FK_dep_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_dep_org FOREIGN KEY (organization_id) REFERENCES organizations(id),

    CONSTRAINT chk_dep_relationship CHECK (relationship IN (
        'spouse', 'domestic_partner', 'child', 'stepchild', 'foster_child',
        'adopted_child', 'parent', 'parent_in_law', 'other'
    ))
);

CREATE INDEX idx_dep_emp ON employee_dependents(employee_id);
CREATE INDEX idx_dep_active ON employee_dependents(employee_id, is_active) WHERE is_active = 1;

PRINT 'Module 08: Employee Contacts - Created Successfully';
