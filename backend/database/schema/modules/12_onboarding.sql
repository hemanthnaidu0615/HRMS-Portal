-- =====================================================
-- MODULE: ONBOARDING
-- Order: 12 (Depends on: 03, 06)
-- Description: Employee onboarding workflow
-- Inspired by: BambooHR, Rippling onboarding
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 12 of 16
-- =====================================================

-- =====================================================
-- TABLE: onboarding_templates
-- Reusable onboarding workflows
-- =====================================================
CREATE TABLE onboarding_templates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Template Info
    template_name VARCHAR(255) NOT NULL,
    template_code VARCHAR(50) NOT NULL,
    description VARCHAR(1000),

    -- Targeting
    employment_type VARCHAR(50),
    department_id UNIQUEIDENTIFIER,
    country_code VARCHAR(3),
    position_id UNIQUEIDENTIFIER,

    -- Settings
    target_completion_days INT DEFAULT 30,
    auto_assign BIT NOT NULL DEFAULT 0,
    send_welcome_email BIT NOT NULL DEFAULT 1,
    allow_self_service BIT NOT NULL DEFAULT 1,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    is_default BIT NOT NULL DEFAULT 0,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    CONSTRAINT FK_ot_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_ot_dept FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT FK_ot_pos FOREIGN KEY (position_id) REFERENCES positions(id),
    CONSTRAINT FK_ot_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_ot_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT UQ_ot_code_org UNIQUE (organization_id, template_code)
);

-- =====================================================
-- TABLE: onboarding_template_steps
-- Steps within templates
-- =====================================================
CREATE TABLE onboarding_template_steps (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    template_id UNIQUEIDENTIFIER NOT NULL,
    depends_on_step_id UNIQUEIDENTIFIER,

    -- Step Info
    step_number INT NOT NULL,
    step_code VARCHAR(50) NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_description VARCHAR(1000),

    -- Categorization
    category VARCHAR(50) NOT NULL,
    step_type VARCHAR(50) NOT NULL DEFAULT 'task',

    -- Timeline
    due_by_days INT,
    reminder_before_days INT,
    escalation_after_days INT,

    -- Assignment
    assigned_to VARCHAR(50) DEFAULT 'employee',
    assigned_role VARCHAR(100),

    -- Settings
    can_be_skipped BIT NOT NULL DEFAULT 0,
    requires_approval BIT NOT NULL DEFAULT 0,
    auto_complete_on_data BIT NOT NULL DEFAULT 0,
    related_table VARCHAR(100),
    related_field VARCHAR(100),

    -- UI
    icon VARCHAR(50),
    color VARCHAR(20),
    help_url VARCHAR(500),

    -- Status
    is_active BIT NOT NULL DEFAULT 1,

    CONSTRAINT FK_ots_template FOREIGN KEY (template_id) REFERENCES onboarding_templates(id) ON DELETE CASCADE,
    CONSTRAINT FK_ots_depends FOREIGN KEY (depends_on_step_id) REFERENCES onboarding_template_steps(id),

    CONSTRAINT chk_ots_category CHECK (category IN ('required_onboarding', 'required_week1', 'required_payroll', 'compliance', 'it_setup', 'training', 'optional')),
    CONSTRAINT chk_ots_type CHECK (step_type IN ('task', 'form', 'document_upload', 'document_sign', 'acknowledgement', 'verification', 'training', 'meeting')),
    CONSTRAINT chk_ots_assigned CHECK (assigned_to IN ('employee', 'hr', 'manager', 'it', 'finance', 'admin', 'buddy', 'custom'))
);

-- =====================================================
-- TABLE: onboarding_checklist_items
-- Items within steps
-- =====================================================
CREATE TABLE onboarding_checklist_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    step_id UNIQUEIDENTIFIER NOT NULL,

    -- Item Info
    item_order INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description VARCHAR(500),

    -- Type & Data
    item_type VARCHAR(50) NOT NULL,
    related_field VARCHAR(100),
    related_table VARCHAR(100),
    required_document_type VARCHAR(50),

    -- For Acknowledgements
    acknowledgement_text VARCHAR(2000),
    requires_signature BIT NOT NULL DEFAULT 0,

    -- Validation
    is_required BIT NOT NULL DEFAULT 1,
    validation_rule VARCHAR(500),
    min_value VARCHAR(100),
    max_value VARCHAR(100),
    regex_pattern VARCHAR(255),

    -- Help
    help_text VARCHAR(500),
    example_text VARCHAR(255),
    help_url VARCHAR(500),

    CONSTRAINT FK_oci_step FOREIGN KEY (step_id) REFERENCES onboarding_template_steps(id) ON DELETE CASCADE,

    CONSTRAINT chk_oci_type CHECK (item_type IN ('form_field', 'document_upload', 'acknowledgement', 'task', 'verification', 'info', 'link', 'video'))
);

-- =====================================================
-- TABLE: employee_onboarding_progress
-- Track employee onboarding
-- =====================================================
CREATE TABLE employee_onboarding_progress (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    template_id UNIQUEIDENTIFIER NOT NULL,

    -- Progress
    overall_status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    overall_percentage INT DEFAULT 0 CHECK (overall_percentage BETWEEN 0 AND 100),

    -- Timeline
    started_at DATETIME2,
    target_completion_date DATE,
    completed_at DATETIME2,

    -- Assignment
    hr_assignee_id UNIQUEIDENTIFIER,
    buddy_id UNIQUEIDENTIFIER,
    manager_id UNIQUEIDENTIFIER,

    -- Metrics
    total_steps INT DEFAULT 0,
    completed_steps INT DEFAULT 0,
    pending_steps INT DEFAULT 0,
    overdue_steps INT DEFAULT 0,
    skipped_steps INT DEFAULT 0,

    -- JSON Progress
    steps_progress NVARCHAR(MAX),

    -- Feedback
    hr_notes VARCHAR(2000),
    employee_feedback VARCHAR(2000),
    feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_submitted_at DATETIME2,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    CONSTRAINT FK_eop_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_eop_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_eop_template FOREIGN KEY (template_id) REFERENCES onboarding_templates(id),
    CONSTRAINT FK_eop_hr FOREIGN KEY (hr_assignee_id) REFERENCES employees(id),
    CONSTRAINT FK_eop_buddy FOREIGN KEY (buddy_id) REFERENCES employees(id),
    CONSTRAINT FK_eop_manager FOREIGN KEY (manager_id) REFERENCES employees(id),

    CONSTRAINT chk_eop_status CHECK (overall_status IN ('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'))
);

-- =====================================================
-- TABLE: employee_onboarding_step_status
-- Individual step progress
-- =====================================================
CREATE TABLE employee_onboarding_step_status (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    onboarding_progress_id UNIQUEIDENTIFIER NOT NULL,
    step_id UNIQUEIDENTIFIER NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    percentage INT DEFAULT 0 CHECK (percentage BETWEEN 0 AND 100),

    -- Timeline
    started_at DATETIME2,
    completed_at DATETIME2,
    due_date DATE,
    is_overdue BIT NOT NULL DEFAULT 0,

    -- Completion
    completed_by UNIQUEIDENTIFIER,
    completion_notes VARCHAR(500),
    completion_data NVARCHAR(MAX),

    -- Blocking
    blocked_reason VARCHAR(500),
    blocked_by_step_id UNIQUEIDENTIFIER,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    CONSTRAINT FK_eoss_progress FOREIGN KEY (onboarding_progress_id) REFERENCES employee_onboarding_progress(id) ON DELETE CASCADE,
    CONSTRAINT FK_eoss_step FOREIGN KEY (step_id) REFERENCES onboarding_template_steps(id),
    CONSTRAINT FK_eoss_completed_by FOREIGN KEY (completed_by) REFERENCES users(id),
    CONSTRAINT FK_eoss_blocked_by FOREIGN KEY (blocked_by_step_id) REFERENCES onboarding_template_steps(id),

    CONSTRAINT chk_eoss_status CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked', 'not_applicable'))
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_ot_org ON onboarding_templates(organization_id);
CREATE INDEX idx_ot_active ON onboarding_templates(organization_id, is_active) WHERE is_active = 1;
CREATE INDEX idx_ots_template ON onboarding_template_steps(template_id);
CREATE INDEX idx_oci_step ON onboarding_checklist_items(step_id);
CREATE INDEX idx_eop_emp ON employee_onboarding_progress(employee_id);
CREATE INDEX idx_eop_status ON employee_onboarding_progress(overall_status);
CREATE INDEX idx_eop_hr ON employee_onboarding_progress(hr_assignee_id);
CREATE INDEX idx_eoss_progress ON employee_onboarding_step_status(onboarding_progress_id);
CREATE INDEX idx_eoss_status ON employee_onboarding_step_status(status);
CREATE INDEX idx_eoss_overdue ON employee_onboarding_step_status(is_overdue) WHERE is_overdue = 1;

PRINT 'Module 12: Onboarding - Created Successfully';
