-- =====================================================
-- MODULE: EMPLOYEE HISTORY
-- Order: 14 (Depends on: 06_employees_core)
-- Description: Change tracking and audit
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 14 of 16
-- =====================================================

-- =====================================================
-- TABLE: employee_history
-- Track all employee changes
-- =====================================================
CREATE TABLE employee_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Change Details
    change_type VARCHAR(50) NOT NULL,
    changed_field VARCHAR(255) NOT NULL,
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    old_value_display VARCHAR(500),
    new_value_display VARCHAR(500),

    -- Context
    change_reason VARCHAR(500),
    change_category VARCHAR(50),
    related_entity_type VARCHAR(100),
    related_entity_id UNIQUEIDENTIFIER,

    -- Approval (for certain changes)
    requires_approval BIT NOT NULL DEFAULT 0,
    approved_by UNIQUEIDENTIFIER,
    approved_at DATETIME2,
    approval_status VARCHAR(20),

    -- Effective Date
    effective_date DATE,

    -- Audit
    changed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    changed_by UNIQUEIDENTIFIER,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),

    CONSTRAINT FK_eh_emp FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT FK_eh_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_eh_changed_by FOREIGN KEY (changed_by) REFERENCES users(id),
    CONSTRAINT FK_eh_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),

    CONSTRAINT chk_eh_change_type CHECK (change_type IN ('created', 'updated', 'deleted', 'status_change', 'promotion', 'transfer', 'salary_change', 'role_change')),
    CONSTRAINT chk_eh_category CHECK (change_category IN ('personal', 'employment', 'compensation', 'position', 'department', 'reporting', 'status', 'system') OR change_category IS NULL)
);

-- =====================================================
-- TABLE: employee_permission_groups
-- Employee-specific permission groups
-- =====================================================
CREATE TABLE employee_permission_groups (
    employee_id UNIQUEIDENTIFIER NOT NULL,
    group_id UNIQUEIDENTIFIER NOT NULL,
    assigned_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    assigned_by UNIQUEIDENTIFIER,
    expires_at DATETIME2,

    CONSTRAINT PK_epg PRIMARY KEY (employee_id, group_id),
    CONSTRAINT FK_epg_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_epg_group FOREIGN KEY (group_id) REFERENCES permission_groups(id) ON DELETE CASCADE,
    CONSTRAINT FK_epg_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- =====================================================
-- TABLE: employee_notes
-- HR notes about employees
-- =====================================================
CREATE TABLE employee_notes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Note Details
    note_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content NVARCHAR(MAX) NOT NULL,

    -- Visibility
    is_confidential BIT NOT NULL DEFAULT 0,
    visible_to_employee BIT NOT NULL DEFAULT 0,
    visible_to_manager BIT NOT NULL DEFAULT 0,

    -- Related
    related_entity_type VARCHAR(100),
    related_entity_id UNIQUEIDENTIFIER,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER NOT NULL,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    CONSTRAINT FK_en_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_en_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_en_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_en_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),

    CONSTRAINT chk_en_type CHECK (note_type IN ('general', 'performance', 'disciplinary', 'recognition', 'personal', 'medical', 'exit', 'onboarding'))
);

-- =====================================================
-- TABLE: employee_skills
-- Structured skills tracking
-- =====================================================
CREATE TABLE employee_skills (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    skill_name VARCHAR(100) NOT NULL,
    skill_category VARCHAR(50),
    proficiency_level VARCHAR(20),
    years_experience DECIMAL(4,1),
    is_primary BIT NOT NULL DEFAULT 0,
    is_verified BIT NOT NULL DEFAULT 0,
    verified_by UNIQUEIDENTIFIER,
    verified_at DATETIME2,
    last_used_date DATE,
    notes VARCHAR(500),

    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    CONSTRAINT FK_es_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_es_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_es_verified_by FOREIGN KEY (verified_by) REFERENCES users(id),

    CONSTRAINT chk_es_proficiency CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert') OR proficiency_level IS NULL),
    CONSTRAINT UQ_es_emp_skill UNIQUE (employee_id, skill_name)
);

-- =====================================================
-- TABLE: employee_certifications
-- Professional certifications
-- =====================================================
CREATE TABLE employee_certifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    certification_name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    credential_id VARCHAR(100),
    credential_url VARCHAR(500),

    issue_date DATE,
    expiry_date DATE,
    is_expired BIT NOT NULL DEFAULT 0,

    document_id UNIQUEIDENTIFIER,
    is_verified BIT NOT NULL DEFAULT 0,
    verified_by UNIQUEIDENTIFIER,
    verified_at DATETIME2,

    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    CONSTRAINT FK_ec_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_ec_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_ec_doc FOREIGN KEY (document_id) REFERENCES documents(id),
    CONSTRAINT FK_ec_verified_by FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_eh_emp ON employee_history(employee_id);
CREATE INDEX idx_eh_date ON employee_history(changed_at DESC);
CREATE INDEX idx_eh_field ON employee_history(changed_field);
CREATE INDEX idx_eh_type ON employee_history(change_type);
CREATE INDEX idx_epg_emp ON employee_permission_groups(employee_id);
CREATE INDEX idx_en_emp ON employee_notes(employee_id);
CREATE INDEX idx_en_type ON employee_notes(note_type);
CREATE INDEX idx_es_emp ON employee_skills(employee_id);
CREATE INDEX idx_es_skill ON employee_skills(skill_name);
CREATE INDEX idx_ec_emp ON employee_certifications(employee_id);
CREATE INDEX idx_ec_expiry ON employee_certifications(expiry_date) WHERE expiry_date IS NOT NULL;

PRINT 'Module 14: Employee History - Created Successfully';
