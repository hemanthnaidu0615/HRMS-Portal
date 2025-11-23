-- =====================================================
-- MODULE: IDENTITY DOCUMENTS
-- Order: 09 (Depends on: 06_employees_core)
-- Description: Country-agnostic identity management
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 9 of 16
-- =====================================================

-- =====================================================
-- TABLE: identity_document_types
-- Reference table for all document types
-- =====================================================
CREATE TABLE identity_document_types (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER,

    -- Type Info
    document_type_code VARCHAR(50) NOT NULL,
    document_type_name VARCHAR(255) NOT NULL,
    description VARCHAR(500),

    -- Country
    country_code VARCHAR(3),
    country_name VARCHAR(100),

    -- Validation
    format_regex VARCHAR(255),
    format_example VARCHAR(100),
    format_description VARCHAR(255),
    max_length INT,
    min_length INT,

    -- Requirements
    is_required_for_payroll BIT NOT NULL DEFAULT 0,
    is_required_for_tax BIT NOT NULL DEFAULT 0,
    is_required_for_work_auth BIT NOT NULL DEFAULT 0,
    is_required_for_i9 BIT NOT NULL DEFAULT 0,
    is_government_issued BIT NOT NULL DEFAULT 1,
    has_expiry_date BIT NOT NULL DEFAULT 0,

    -- Categorization
    category VARCHAR(50) NOT NULL,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    is_system_type BIT NOT NULL DEFAULT 1,

    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_idt_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT chk_idt_category CHECK (category IN ('tax_id', 'national_id', 'work_auth', 'driving', 'passport', 'visa', 'professional', 'other'))
);

-- =====================================================
-- TABLE: employee_identity_documents
-- Actual employee documents
-- =====================================================
CREATE TABLE employee_identity_documents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    document_type_id UNIQUEIDENTIFIER NOT NULL,

    -- Document Details
    document_number VARCHAR(100) NOT NULL,
    document_number_masked VARCHAR(20),
    issuing_authority VARCHAR(255),
    issuing_country VARCHAR(100),
    issuing_state VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,

    -- Verification
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    verified_at DATETIME2,
    verified_by UNIQUEIDENTIFIER,
    verification_notes VARCHAR(500),
    rejection_reason VARCHAR(500),

    -- File Storage
    document_file_id UNIQUEIDENTIFIER,
    document_front_url VARCHAR(500),
    document_back_url VARCHAR(500),

    -- Flags
    is_primary_tax_id BIT NOT NULL DEFAULT 0,
    is_work_authorization BIT NOT NULL DEFAULT 0,
    used_for_i9 BIT NOT NULL DEFAULT 0,
    is_verified_by_everify BIT NOT NULL DEFAULT 0,

    -- Expiry Alerts
    expiry_reminder_sent BIT NOT NULL DEFAULT 0,
    expiry_reminder_date DATETIME2,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    CONSTRAINT FK_eid_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_eid_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_eid_type FOREIGN KEY (document_type_id) REFERENCES identity_document_types(id),
    CONSTRAINT FK_eid_verified_by FOREIGN KEY (verified_by) REFERENCES users(id),
    CONSTRAINT FK_eid_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_eid_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),

    CONSTRAINT chk_eid_status CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired', 'needs_update'))
);

-- Only one primary tax ID per country per employee
CREATE UNIQUE INDEX idx_emp_primary_tax_id ON employee_identity_documents(employee_id, issuing_country)
    WHERE is_primary_tax_id = 1;

CREATE INDEX idx_eid_emp ON employee_identity_documents(employee_id);
CREATE INDEX idx_eid_type ON employee_identity_documents(document_type_id);
CREATE INDEX idx_eid_status ON employee_identity_documents(verification_status);
CREATE INDEX idx_eid_expiry ON employee_identity_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_eid_work_auth ON employee_identity_documents(employee_id, is_work_authorization) WHERE is_work_authorization = 1;

PRINT 'Module 09: Identity Documents - Created Successfully';
