-- =====================================================
-- MODULE: DOCUMENT SIGNING
-- Order: 17 (Depends on: employees, documents)
-- Description: E-signature workflow for employee onboarding documents
-- =====================================================
-- Inspired by: DocuSign, Adobe Sign, HelloSign
-- =====================================================

-- =====================================================
-- TABLE: document_templates
-- Reusable document templates for signing
-- =====================================================
CREATE TABLE document_templates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Template Details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    document_type VARCHAR(100) NOT NULL CHECK (document_type IN (
        'offer_letter', 'employment_contract', 'nda', 'employee_handbook',
        'benefits_enrollment', 'tax_form', 'policy_acknowledgment', 'code_of_conduct',
        'contractor_agreement', 'exit_paperwork', 'custom'
    )),

    -- Template Content
    template_content TEXT, -- HTML content with placeholders like {{employee_name}}
    file_storage_path VARCHAR(500), -- Path to stored template file (PDF, DOCX)
    file_type VARCHAR(50), -- pdf, docx, html

    -- Signing Configuration
    requires_signature BIT NOT NULL DEFAULT 1,
    signature_required_from VARCHAR(50) CHECK (signature_required_from IN ('employee', 'employer', 'both', 'multiple')),
    auto_send_on_hire BIT NOT NULL DEFAULT 0, -- Auto-send when employee is created
    send_order INT DEFAULT 1, -- Order in which to send multiple documents

    -- Status
    is_active BIT NOT NULL DEFAULT 1,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    CONSTRAINT FK_doc_templates_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT FK_doc_templates_created FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_doc_templates_updated FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX IX_doc_templates_org ON document_templates(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IX_doc_templates_type ON document_templates(document_type, is_active) WHERE deleted_at IS NULL;

-- =====================================================
-- TABLE: employee_documents_to_sign
-- Documents sent to employees for signature
-- =====================================================
CREATE TABLE employee_documents_to_sign (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    template_id UNIQUEIDENTIFIER NULL, -- NULL if uploaded directly, not from template

    -- Document Details
    document_name VARCHAR(200) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    description TEXT,

    -- File Storage
    file_storage_path VARCHAR(500) NOT NULL, -- Path to the actual document
    file_type VARCHAR(50) NOT NULL, -- pdf, docx
    file_size_kb INT,

    -- Signing Workflow
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'draft', 'pending', 'sent', 'viewed', 'signed', 'declined', 'expired', 'cancelled', 'completed'
    )),
    sent_at DATETIME2,
    viewed_at DATETIME2,
    signed_at DATETIME2,
    declined_at DATETIME2,
    expired_at DATETIME2,
    expiry_date DATETIME2, -- When the signing request expires

    -- Signature Details
    employee_signature_data TEXT, -- Base64 encoded signature image or digital signature
    employee_signature_ip VARCHAR(50), -- IP address from where signed
    employee_signature_location VARCHAR(200), -- Geolocation if available
    employee_signed_by UNIQUEIDENTIFIER, -- User who signed (normally employee's user)

    -- Employer/Company Signature (for contracts that need both parties)
    employer_signature_required BIT NOT NULL DEFAULT 0,
    employer_signed_by UNIQUEIDENTIFIER,
    employer_signature_data TEXT,
    employer_signed_at DATETIME2,

    -- Tracking
    reminder_sent_count INT DEFAULT 0,
    last_reminder_sent DATETIME2,

    -- Notes
    decline_reason TEXT,
    admin_notes TEXT,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    CONSTRAINT FK_emp_docs_sign_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT FK_emp_docs_sign_emp FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT FK_emp_docs_sign_template FOREIGN KEY (template_id) REFERENCES document_templates(id),
    CONSTRAINT FK_emp_docs_sign_created FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_emp_docs_sign_updated FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT FK_emp_docs_sign_emp_signed FOREIGN KEY (employee_signed_by) REFERENCES users(id),
    CONSTRAINT FK_emp_docs_sign_employer_signed FOREIGN KEY (employer_signed_by) REFERENCES users(id),
    CONSTRAINT CHK_signed_dates CHECK (signed_at IS NULL OR sent_at IS NOT NULL)
);

CREATE INDEX IX_emp_docs_sign_employee ON employee_documents_to_sign(employee_id, status);
CREATE INDEX IX_emp_docs_sign_org ON employee_documents_to_sign(organization_id, status);
CREATE INDEX IX_emp_docs_sign_status ON employee_documents_to_sign(status, expiry_date);
CREATE INDEX IX_emp_docs_sign_sent ON employee_documents_to_sign(sent_at) WHERE status IN ('sent', 'viewed');

-- =====================================================
-- TABLE: onboarding_document_checklists
-- Define which documents employees must complete during onboarding
-- =====================================================
CREATE TABLE onboarding_document_checklists (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,

    -- Checklist Item
    checklist_item_name VARCHAR(200) NOT NULL,
    checklist_item_type VARCHAR(100) CHECK (checklist_item_type IN (
        'upload_photo', 'upload_id_proof', 'upload_address_proof',
        'sign_offer_letter', 'sign_contract', 'sign_nda',
        'sign_handbook', 'sign_code_of_conduct',
        'complete_tax_form', 'enroll_benefits', 'setup_direct_deposit',
        'emergency_contact_info', 'custom'
    )),
    description TEXT,

    -- Linked Document
    document_to_sign_id UNIQUEIDENTIFIER, -- Link to employee_documents_to_sign if applicable

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'skipped', 'na'
    )),
    is_mandatory BIT NOT NULL DEFAULT 1,
    due_date DATE,
    completed_at DATETIME2,
    completed_by UNIQUEIDENTIFIER,

    -- Display Order
    display_order INT DEFAULT 0,

    -- Notes
    notes TEXT,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,

    CONSTRAINT FK_onboard_checklist_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT FK_onboard_checklist_emp FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT FK_onboard_checklist_doc FOREIGN KEY (document_to_sign_id) REFERENCES employee_documents_to_sign(id),
    CONSTRAINT FK_onboard_checklist_completed FOREIGN KEY (completed_by) REFERENCES users(id)
);

CREATE INDEX IX_onboard_checklist_emp ON onboarding_document_checklists(employee_id, status);
CREATE INDEX IX_onboard_checklist_org ON onboarding_document_checklists(organization_id);
CREATE INDEX IX_onboard_checklist_due ON onboarding_document_checklists(due_date) WHERE status = 'pending';

-- =====================================================
-- TABLE: signature_audit_log
-- Comprehensive audit trail for all signature activities
-- =====================================================
CREATE TABLE signature_audit_log (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    document_to_sign_id UNIQUEIDENTIFIER NOT NULL,

    -- Event Details
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN (
        'created', 'sent', 'viewed', 'downloaded', 'signed', 'declined',
        'reminder_sent', 'expired', 'cancelled', 'completed'
    )),
    event_timestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    performed_by UNIQUEIDENTIFIER, -- User who performed the action

    -- Technical Details
    ip_address VARCHAR(50),
    user_agent TEXT,
    geolocation VARCHAR(200),

    -- Additional Context
    event_details TEXT, -- JSON with additional event data

    CONSTRAINT FK_signature_audit_doc FOREIGN KEY (document_to_sign_id) REFERENCES employee_documents_to_sign(id) ON DELETE CASCADE,
    CONSTRAINT FK_signature_audit_user FOREIGN KEY (performed_by) REFERENCES users(id)
);

CREATE INDEX IX_signature_audit_doc ON signature_audit_log(document_to_sign_id, event_timestamp);
CREATE INDEX IX_signature_audit_event ON signature_audit_log(event_type, event_timestamp);

-- =====================================================
-- SAMPLE DATA & VIEWS
-- =====================================================
GO

-- View: Pending signatures summary
CREATE VIEW vw_pending_signatures AS
SELECT
    d.id,
    d.employee_id,
    e.first_name + ' ' + e.last_name AS employee_name,
    u.email AS employee_email,
    d.document_name,
    d.document_type,
    d.status,
    d.sent_at,
    d.expiry_date,
    DATEDIFF(DAY, GETDATE(), d.expiry_date) AS days_until_expiry,
    d.reminder_sent_count,
    d.organization_id
FROM employee_documents_to_sign d
INNER JOIN employees e ON d.employee_id = e.id
INNER JOIN users u ON e.user_id = u.id
WHERE d.status IN ('sent', 'viewed')
    AND (d.expiry_date IS NULL OR d.expiry_date > GETDATE());
GO

-- View: Onboarding completion status
CREATE VIEW vw_onboarding_completion AS
SELECT
    e.id AS employee_id,
    e.first_name + ' ' + e.last_name AS employee_name,
    e.organization_id,
    COUNT(c.id) AS total_checklist_items,
    SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) AS completed_items,
    SUM(CASE WHEN c.is_mandatory = 1 THEN 1 ELSE 0 END) AS mandatory_items,
    SUM(CASE WHEN c.is_mandatory = 1 AND c.status = 'completed' THEN 1 ELSE 0 END) AS mandatory_completed,
    CASE
        WHEN SUM(CASE WHEN c.is_mandatory = 1 THEN 1 ELSE 0 END) =
             SUM(CASE WHEN c.is_mandatory = 1 AND c.status = 'completed' THEN 1 ELSE 0 END)
        THEN 1 ELSE 0
    END AS all_mandatory_complete
FROM employees e
LEFT JOIN onboarding_document_checklists c ON e.id = c.employee_id
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.first_name, e.last_name, e.organization_id;
GO

PRINT 'Module 17: Document Signing - Created Successfully';
GO
