-- =====================================================
-- MODULE: ORGANIZATION STRUCTURE
-- Order: 03 (Depends on: 01_core_foundation)
-- Description: Departments, Positions, Hierarchy
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 3 of 16
-- =====================================================

-- =====================================================
-- TABLE: departments
-- Organizational departments
-- =====================================================
CREATE TABLE departments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    parent_department_id UNIQUEIDENTIFIER NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    head_employee_id UNIQUEIDENTIFIER,
    cost_center_code VARCHAR(50),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,
    CONSTRAINT FK_depts_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_depts_parent FOREIGN KEY (parent_department_id) REFERENCES departments(id),
    CONSTRAINT FK_depts_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT UQ_dept_code_org UNIQUE (organization_id, code)
);

-- =====================================================
-- TABLE: positions
-- Job positions/titles
-- =====================================================
CREATE TABLE positions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    department_id UNIQUEIDENTIFIER,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    job_family VARCHAR(100),
    seniority_level INT NOT NULL DEFAULT 1 CHECK (seniority_level BETWEEN 1 AND 10),
    min_salary DECIMAL(15,2),
    max_salary DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,
    CONSTRAINT FK_pos_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_pos_dept FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT FK_pos_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT UQ_pos_code_org UNIQUE (organization_id, code),
    CONSTRAINT chk_pos_salary CHECK (max_salary IS NULL OR min_salary IS NULL OR max_salary >= min_salary)
);

-- =====================================================
-- TABLE: job_grades
-- Compensation grades
-- =====================================================
CREATE TABLE job_grades (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    grade_code VARCHAR(20) NOT NULL,
    grade_name VARCHAR(100) NOT NULL,
    grade_level INT NOT NULL,
    min_salary DECIMAL(15,2),
    max_salary DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'USD',
    description VARCHAR(500),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_grades_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT UQ_grade_code_org UNIQUE (organization_id, grade_code)
);

-- =====================================================
-- TABLE: work_locations
-- Office locations
-- =====================================================
CREATE TABLE work_locations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    location_code VARCHAR(20) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    location_type VARCHAR(50) CHECK (location_type IN ('headquarters', 'branch', 'remote_hub', 'client_site', 'virtual')),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    country_code VARCHAR(3),
    postal_code VARCHAR(20),
    timezone VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    capacity INT,
    is_primary BIT NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_loc_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT UQ_loc_code_org UNIQUE (organization_id, location_code)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_depts_org ON departments(organization_id);
CREATE INDEX idx_depts_parent ON departments(parent_department_id);
CREATE INDEX idx_depts_active ON departments(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_pos_org ON positions(organization_id);
CREATE INDEX idx_pos_dept ON positions(department_id);
CREATE INDEX idx_pos_active ON positions(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_grades_org ON job_grades(organization_id);
CREATE INDEX idx_loc_org ON work_locations(organization_id);

PRINT 'Module 03: Organization Structure - Created Successfully';
