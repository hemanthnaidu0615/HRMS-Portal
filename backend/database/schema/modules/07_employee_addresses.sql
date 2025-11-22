-- =====================================================
-- MODULE: EMPLOYEE ADDRESSES
-- Order: 07 (Depends on: 06_employees_core)
-- Description: Employee address management
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 7 of 16
-- =====================================================

CREATE TABLE employee_addresses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Address Type
    address_type VARCHAR(50) NOT NULL,
    is_primary BIT NOT NULL DEFAULT 0,

    -- Address Details
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    address_line3 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'United States',
    country_code VARCHAR(3),

    -- Verification
    is_verified BIT NOT NULL DEFAULT 0,
    verified_at DATETIME2,
    verified_by UNIQUEIDENTIFIER,
    proof_document_id UNIQUEIDENTIFIER,
    verification_notes VARCHAR(500),

    -- Validity
    effective_from DATE,
    effective_to DATE,
    is_current BIT NOT NULL DEFAULT 1,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    CONSTRAINT FK_addr_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_addr_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_addr_verified_by FOREIGN KEY (verified_by) REFERENCES users(id),
    CONSTRAINT FK_addr_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_addr_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),

    CONSTRAINT chk_addr_type CHECK (address_type IN ('current', 'permanent', 'mailing', 'work', 'temporary')),
    CONSTRAINT chk_addr_dates CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from)
);

-- Only one primary address per employee (for current addresses)
CREATE UNIQUE INDEX idx_emp_primary_addr ON employee_addresses(employee_id)
    WHERE is_primary = 1 AND is_current = 1;

CREATE INDEX idx_addr_emp ON employee_addresses(employee_id);
CREATE INDEX idx_addr_type ON employee_addresses(address_type);
CREATE INDEX idx_addr_country ON employee_addresses(country_code);
CREATE INDEX idx_addr_current ON employee_addresses(employee_id, is_current) WHERE is_current = 1;

PRINT 'Module 07: Employee Addresses - Created Successfully';
