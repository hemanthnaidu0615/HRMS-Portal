-- =====================================================
-- MODULE: PROJECTS
-- Order: 05 (Depends on: 01, 04)
-- Description: Project management
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 5 of 16
-- =====================================================

-- =====================================================
-- TABLE: projects
-- Client projects
-- =====================================================
CREATE TABLE projects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    client_id UNIQUEIDENTIFIER NOT NULL,

    -- Basic Info
    project_name VARCHAR(255) NOT NULL,
    project_code VARCHAR(50) NOT NULL,
    project_type VARCHAR(50) CHECK (project_type IN ('fixed_price', 'time_and_materials', 'retainer', 'support', 'internal', 'r_and_d')),
    description VARCHAR(2000),

    -- Timeline
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_duration_months INT,
    actual_end_date DATE,

    -- Status
    project_status VARCHAR(50) NOT NULL DEFAULT 'planning' CHECK (project_status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived')),

    -- Financials
    project_budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    billing_rate_type VARCHAR(50) CHECK (billing_rate_type IN ('hourly', 'daily', 'monthly', 'fixed', 'blended')),
    default_billing_rate DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',

    -- Management
    project_manager_id UNIQUEIDENTIFIER,

    -- Metrics
    total_allocated_resources INT DEFAULT 0,
    total_hours_logged DECIMAL(10,2) DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    health_score INT CHECK (health_score BETWEEN 0 AND 100),

    -- Flags
    is_billable BIT NOT NULL DEFAULT 1,
    requires_timesheet BIT NOT NULL DEFAULT 1,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    CONSTRAINT FK_projects_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_projects_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT FK_projects_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_projects_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT UQ_project_code_org UNIQUE (organization_id, project_code),
    CONSTRAINT chk_project_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- =====================================================
-- TABLE: project_tasks
-- Project task breakdown
-- =====================================================
CREATE TABLE project_tasks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    project_id UNIQUEIDENTIFIER NOT NULL,
    parent_task_id UNIQUEIDENTIFIER,

    task_code VARCHAR(50) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),

    -- Timeline
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2) DEFAULT 0,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    -- Assignment
    assigned_to_id UNIQUEIDENTIFIER,

    -- Flags
    is_billable BIT NOT NULL DEFAULT 1,
    is_milestone BIT NOT NULL DEFAULT 0,

    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT FK_tasks_parent FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_tasks_status ON project_tasks(status);
CREATE INDEX idx_tasks_assigned ON project_tasks(assigned_to_id);

PRINT 'Module 05: Projects - Created Successfully';
