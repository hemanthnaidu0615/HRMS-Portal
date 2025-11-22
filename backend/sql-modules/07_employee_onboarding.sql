-- =====================================================
-- EMPLOYEE ONBOARDING MODULE
-- Track onboarding progress step by step
-- =====================================================

-- ========================================
-- ONBOARDING TEMPLATES (Organization-defined)
-- ========================================
CREATE TABLE onboarding_templates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    template_name VARCHAR(255) NOT NULL,                -- e.g., "Standard Employee Onboarding"
    description VARCHAR(1000),

    -- Applicability
    employment_type VARCHAR(50),                        -- NULL = all types, or specific type
    department_id UNIQUEIDENTIFIER,                     -- NULL = all departments
    country_code VARCHAR(3),                            -- NULL = all countries

    -- Status
    is_active BIT DEFAULT 1,
    is_default BIT DEFAULT 0,

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

-- ========================================
-- ONBOARDING STEPS (Template steps)
-- ========================================
CREATE TABLE onboarding_template_steps (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    template_id UNIQUEIDENTIFIER NOT NULL,

    -- Step Details
    step_number INT NOT NULL,                           -- 1, 2, 3, etc.
    step_code VARCHAR(50) NOT NULL,                     -- unique code: BASIC_INFO, PERSONAL, etc.
    step_name VARCHAR(255) NOT NULL,                    -- "Basic Information"
    step_description VARCHAR(1000),

    -- Categorization
    category VARCHAR(50) NOT NULL,                      -- required_onboarding, required_week1, required_payroll, optional

    -- Timing
    due_by_days INT,                                    -- Due X days after joining
    reminder_before_days INT,                           -- Send reminder X days before due

    -- Dependencies
    depends_on_step_id UNIQUEIDENTIFIER,                -- Must complete this step first

    -- Assignment
    assigned_to VARCHAR(50) DEFAULT 'employee',         -- employee, hr, manager, it
    can_be_skipped BIT DEFAULT 0,

    -- UI Configuration
    icon VARCHAR(50),                                   -- Icon name for UI
    color VARCHAR(20),                                  -- Hex color for UI

    -- Status
    is_active BIT DEFAULT 1,

    FOREIGN KEY (template_id) REFERENCES onboarding_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_step_id) REFERENCES onboarding_template_steps(id),

    CONSTRAINT chk_ots_category CHECK (category IN ('required_onboarding', 'required_week1', 'required_payroll', 'optional')),
    CONSTRAINT chk_ots_assigned CHECK (assigned_to IN ('employee', 'hr', 'manager', 'it', 'finance', 'admin'))
);

-- ========================================
-- ONBOARDING CHECKLIST ITEMS (within steps)
-- ========================================
CREATE TABLE onboarding_checklist_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    step_id UNIQUEIDENTIFIER NOT NULL,

    -- Item Details
    item_order INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,                    -- "Enter your phone number"
    item_description VARCHAR(500),

    -- Type
    item_type VARCHAR(50) NOT NULL,                     -- form_field, document_upload, acknowledgement, task, verification

    -- For form fields
    related_field VARCHAR(100),                         -- employees.phone_number
    related_table VARCHAR(100),                         -- employee_addresses

    -- For document uploads
    required_document_type VARCHAR(50),                 -- passport, tax_id, bank_proof

    -- For acknowledgements
    acknowledgement_text VARCHAR(2000),                 -- Text to acknowledge

    -- Validation
    is_required BIT DEFAULT 1,
    validation_rule VARCHAR(500),                       -- JSON validation rules

    -- Help
    help_text VARCHAR(500),
    example_text VARCHAR(255),

    FOREIGN KEY (step_id) REFERENCES onboarding_template_steps(id) ON DELETE CASCADE,

    CONSTRAINT chk_oci_type CHECK (item_type IN ('form_field', 'document_upload', 'acknowledgement', 'task', 'verification', 'info'))
);

-- ========================================
-- EMPLOYEE ONBOARDING PROGRESS
-- ========================================
CREATE TABLE employee_onboarding_progress (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    template_id UNIQUEIDENTIFIER NOT NULL,

    -- ========================================
    -- OVERALL PROGRESS
    -- ========================================
    overall_status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    overall_percentage INT DEFAULT 0,                   -- 0-100

    -- Dates
    started_at DATETIME2,
    target_completion_date DATE,
    completed_at DATETIME2,

    -- Assigned HR/Buddy
    hr_assignee_id UNIQUEIDENTIFIER,
    buddy_id UNIQUEIDENTIFIER,

    -- ========================================
    -- STEP-WISE PROGRESS (JSON for flexibility)
    -- ========================================
    -- This stores detailed progress per step
    -- Format: { "BASIC_INFO": { "status": "completed", "completed_at": "..." }, ... }
    steps_progress NVARCHAR(MAX),

    -- ========================================
    -- STATISTICS
    -- ========================================
    total_steps INT DEFAULT 0,
    completed_steps INT DEFAULT 0,
    pending_steps INT DEFAULT 0,
    overdue_steps INT DEFAULT 0,

    -- ========================================
    -- NOTES & FEEDBACK
    -- ========================================
    hr_notes VARCHAR(2000),
    employee_feedback VARCHAR(2000),
    feedback_rating INT,                                -- 1-5 rating of onboarding experience

    -- ========================================
    -- AUDIT
    -- ========================================
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (template_id) REFERENCES onboarding_templates(id),
    FOREIGN KEY (hr_assignee_id) REFERENCES employees(id),
    FOREIGN KEY (buddy_id) REFERENCES employees(id),

    CONSTRAINT chk_eop_status CHECK (overall_status IN ('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'))
);

-- ========================================
-- EMPLOYEE ONBOARDING STEP STATUS
-- (Detailed tracking per step)
-- ========================================
CREATE TABLE employee_onboarding_step_status (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    onboarding_progress_id UNIQUEIDENTIFIER NOT NULL,
    step_id UNIQUEIDENTIFIER NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',      -- pending, in_progress, completed, skipped, blocked
    percentage INT DEFAULT 0,

    -- Timing
    started_at DATETIME2,
    completed_at DATETIME2,
    due_date DATE,
    is_overdue BIT DEFAULT 0,

    -- Completion
    completed_by UNIQUEIDENTIFIER,                      -- Who marked it complete
    completion_notes VARCHAR(500),

    -- For blocked status
    blocked_reason VARCHAR(500),
    blocked_by_step_id UNIQUEIDENTIFIER,

    -- ========================================
    -- AUDIT
    -- ========================================
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    FOREIGN KEY (onboarding_progress_id) REFERENCES employee_onboarding_progress(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES onboarding_template_steps(id),
    FOREIGN KEY (completed_by) REFERENCES users(id),
    FOREIGN KEY (blocked_by_step_id) REFERENCES onboarding_template_steps(id),

    CONSTRAINT chk_eoss_status CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked'))
);

-- ========================================
-- EMPLOYEE CHECKLIST ITEM STATUS
-- ========================================
CREATE TABLE employee_checklist_item_status (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    step_status_id UNIQUEIDENTIFIER NOT NULL,
    checklist_item_id UNIQUEIDENTIFIER NOT NULL,

    -- Status
    is_completed BIT DEFAULT 0,
    completed_at DATETIME2,
    completed_by UNIQUEIDENTIFIER,

    -- For acknowledgements
    acknowledged BIT DEFAULT 0,
    acknowledged_at DATETIME2,

    -- For document uploads
    uploaded_document_id UNIQUEIDENTIFIER,

    -- Notes
    notes VARCHAR(500),

    -- ========================================
    -- AUDIT
    -- ========================================
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    FOREIGN KEY (step_status_id) REFERENCES employee_onboarding_step_status(id) ON DELETE CASCADE,
    FOREIGN KEY (checklist_item_id) REFERENCES onboarding_checklist_items(id),
    FOREIGN KEY (completed_by) REFERENCES users(id),
    FOREIGN KEY (uploaded_document_id) REFERENCES documents(id)
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_onb_templates_org ON onboarding_templates(organization_id);
CREATE INDEX idx_onb_templates_active ON onboarding_templates(is_active, is_default);

CREATE INDEX idx_onb_steps_template ON onboarding_template_steps(template_id);
CREATE INDEX idx_onb_steps_order ON onboarding_template_steps(template_id, step_number);

CREATE INDEX idx_onb_items_step ON onboarding_checklist_items(step_id);

CREATE INDEX idx_emp_onb_progress_employee ON employee_onboarding_progress(employee_id);
CREATE INDEX idx_emp_onb_progress_status ON employee_onboarding_progress(overall_status);
CREATE INDEX idx_emp_onb_progress_hr ON employee_onboarding_progress(hr_assignee_id);

CREATE INDEX idx_emp_onb_step_status_progress ON employee_onboarding_step_status(onboarding_progress_id);
CREATE INDEX idx_emp_onb_step_status_status ON employee_onboarding_step_status(status);
CREATE INDEX idx_emp_onb_step_status_overdue ON employee_onboarding_step_status(is_overdue) WHERE is_overdue = 1;

-- ========================================
-- SEED DATA: Default Onboarding Template
-- ========================================
-- This will be inserted for each organization during setup
