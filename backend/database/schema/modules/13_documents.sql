-- =====================================================
-- MODULE: DOCUMENTS
-- Order: 13 (Depends on: 06_employees_core)
-- Description: Document management system
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 13 of 16
-- =====================================================

-- =====================================================
-- TABLE: document_categories
-- Categorize documents
-- =====================================================
CREATE TABLE document_categories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER,

    category_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    parent_category_id UNIQUEIDENTIFIER,

    -- Settings
    allowed_extensions VARCHAR(255) DEFAULT '.pdf,.doc,.docx,.jpg,.jpeg,.png',
    max_file_size_mb INT DEFAULT 10,
    retention_days INT,
    requires_approval BIT NOT NULL DEFAULT 0,
    is_confidential BIT NOT NULL DEFAULT 0,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    is_system_category BIT NOT NULL DEFAULT 0,

    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_dc_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_dc_parent FOREIGN KEY (parent_category_id) REFERENCES document_categories(id)
);

-- =====================================================
-- TABLE: documents
-- Employee documents
-- =====================================================
CREATE TABLE documents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    category_id UNIQUEIDENTIFIER,
    uploaded_by UNIQUEIDENTIFIER NOT NULL,

    -- File Info
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_hash VARCHAR(64),

    -- Document Info
    document_type VARCHAR(100),
    document_category VARCHAR(100),
    title VARCHAR(255),
    description VARCHAR(1000),
    tags VARCHAR(500),

    -- Validity
    issue_date DATE,
    expiry_date DATE,
    is_expired BIT NOT NULL DEFAULT 0,

    -- Approval
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by UNIQUEIDENTIFIER,
    approved_at DATETIME2,
    rejection_reason VARCHAR(500),

    -- Access Control
    is_confidential BIT NOT NULL DEFAULT 0,
    visible_to_employee BIT NOT NULL DEFAULT 1,
    visible_to_manager BIT NOT NULL DEFAULT 0,

    -- Version Control
    version INT NOT NULL DEFAULT 1,
    parent_document_id UNIQUEIDENTIFIER,
    is_latest_version BIT NOT NULL DEFAULT 1,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,
    deleted_by UNIQUEIDENTIFIER,

    CONSTRAINT FK_docs_emp FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT FK_docs_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_docs_category FOREIGN KEY (category_id) REFERENCES document_categories(id),
    CONSTRAINT FK_docs_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id),
    CONSTRAINT FK_docs_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT FK_docs_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT FK_docs_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id),
    CONSTRAINT FK_docs_parent FOREIGN KEY (parent_document_id) REFERENCES documents(id),

    CONSTRAINT chk_docs_status CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'ARCHIVED'))
);

-- =====================================================
-- TABLE: document_requests
-- Request documents from employees
-- =====================================================
CREATE TABLE document_requests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    requester_id UNIQUEIDENTIFIER NOT NULL,
    target_employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Request Details
    document_type_requested VARCHAR(100) NOT NULL,
    message VARCHAR(1000),
    purpose VARCHAR(255),

    -- Timeline
    due_date DATE,
    reminder_sent BIT NOT NULL DEFAULT 0,
    reminder_count INT DEFAULT 0,
    last_reminder_at DATETIME2,

    -- Priority
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    is_urgent BIT NOT NULL DEFAULT 0,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    fulfilled_document_id UNIQUEIDENTIFIER,
    rejection_reason VARCHAR(500),

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    completed_at DATETIME2,

    CONSTRAINT FK_dr_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_dr_requester FOREIGN KEY (requester_id) REFERENCES users(id),
    CONSTRAINT FK_dr_target FOREIGN KEY (target_employee_id) REFERENCES employees(id),
    CONSTRAINT FK_dr_fulfilled FOREIGN KEY (fulfilled_document_id) REFERENCES documents(id),

    CONSTRAINT chk_dr_status CHECK (status IN ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'OVERDUE')),
    CONSTRAINT chk_dr_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- =====================================================
-- TABLE: document_acknowledgements
-- Track document acknowledgements
-- =====================================================
CREATE TABLE document_acknowledgements (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    document_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    acknowledged_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    signature_data NVARCHAR(MAX),

    CONSTRAINT FK_da_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT FK_da_emp FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT UQ_da_doc_emp UNIQUE (document_id, employee_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_dc_org ON document_categories(organization_id);
CREATE INDEX idx_docs_emp ON documents(employee_id);
CREATE INDEX idx_docs_org ON documents(organization_id);
CREATE INDEX idx_docs_status ON documents(approval_status);
CREATE INDEX idx_docs_type ON documents(document_type);
CREATE INDEX idx_docs_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_docs_active ON documents(employee_id, is_latest_version) WHERE deleted_at IS NULL;
CREATE INDEX idx_dr_target ON document_requests(target_employee_id);
CREATE INDEX idx_dr_status ON document_requests(status);
CREATE INDEX idx_dr_due ON document_requests(due_date) WHERE status = 'REQUESTED';
CREATE INDEX idx_da_doc ON document_acknowledgements(document_id);
CREATE INDEX idx_da_emp ON document_acknowledgements(employee_id);

-- Add FK for proof documents
ALTER TABLE employee_addresses ADD CONSTRAINT FK_addr_proof_document FOREIGN KEY (proof_document_id) REFERENCES documents(id);
ALTER TABLE employee_bank_accounts ADD CONSTRAINT FK_ba_proof_document FOREIGN KEY (proof_document_id) REFERENCES documents(id);
ALTER TABLE employee_identity_documents ADD CONSTRAINT FK_eid_file FOREIGN KEY (document_file_id) REFERENCES documents(id);
ALTER TABLE employee_tax_info ADD CONSTRAINT FK_ti_declaration_document FOREIGN KEY (declaration_document_id) REFERENCES documents(id);

PRINT 'Module 13: Documents - Created Successfully';
