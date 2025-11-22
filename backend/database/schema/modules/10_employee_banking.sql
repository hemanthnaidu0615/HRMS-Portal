-- =====================================================
-- MODULE: EMPLOYEE BANKING
-- Order: 10 (Depends on: 06_employees_core)
-- Description: Bank accounts for payroll
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 10 of 16
-- =====================================================

CREATE TABLE employee_bank_accounts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Account Purpose
    account_purpose VARCHAR(50) NOT NULL DEFAULT 'salary',
    is_primary BIT NOT NULL DEFAULT 0,
    priority INT DEFAULT 1,

    -- Bank Info
    bank_name VARCHAR(255) NOT NULL,
    bank_branch VARCHAR(255),
    bank_address VARCHAR(500),
    bank_country VARCHAR(100) NOT NULL DEFAULT 'United States',
    bank_country_code VARCHAR(3),

    -- Account Details
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_number_masked VARCHAR(20),
    account_type VARCHAR(50) DEFAULT 'checking',
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',

    -- Routing (Country-specific)
    -- USA
    routing_number VARCHAR(20),
    -- UK
    sort_code VARCHAR(10),
    -- India
    ifsc_code VARCHAR(15),
    -- Australia
    bsb_code VARCHAR(10),
    -- Canada
    transit_number VARCHAR(10),
    institution_number VARCHAR(5),
    -- International
    swift_code VARCHAR(11),
    iban VARCHAR(34),
    -- Mexico
    clabe VARCHAR(20),

    -- Verification
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    verified_at DATETIME2,
    verified_by UNIQUEIDENTIFIER,
    verification_method VARCHAR(50),
    verification_notes VARCHAR(500),
    proof_document_id UNIQUEIDENTIFIER,

    -- Split Deposit
    split_type VARCHAR(20),
    split_value DECIMAL(10,2),
    split_percentage DECIMAL(5,2) CHECK (split_percentage BETWEEN 0 AND 100),

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    deactivated_at DATETIME2,
    deactivation_reason VARCHAR(255),

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    CONSTRAINT FK_ba_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_ba_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_ba_verified_by FOREIGN KEY (verified_by) REFERENCES users(id),
    CONSTRAINT FK_ba_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_ba_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),

    CONSTRAINT chk_ba_purpose CHECK (account_purpose IN ('salary', 'reimbursement', 'bonus', 'all')),
    CONSTRAINT chk_ba_type CHECK (account_type IN ('checking', 'savings', 'current', 'salary', 'money_market')),
    CONSTRAINT chk_ba_status CHECK (verification_status IN ('pending', 'verified', 'failed', 'needs_update')),
    CONSTRAINT chk_ba_split_type CHECK (split_type IN ('percentage', 'fixed', 'remainder') OR split_type IS NULL),
    CONSTRAINT chk_ba_verification_method CHECK (verification_method IN ('micro_deposit', 'plaid', 'manual', 'document') OR verification_method IS NULL)
);

-- Only one primary bank account per employee for salary purpose
CREATE UNIQUE INDEX idx_emp_primary_bank ON employee_bank_accounts(employee_id)
    WHERE is_primary = 1 AND is_active = 1 AND account_purpose = 'salary';

CREATE INDEX idx_ba_emp ON employee_bank_accounts(employee_id);
CREATE INDEX idx_ba_status ON employee_bank_accounts(verification_status);
CREATE INDEX idx_ba_active ON employee_bank_accounts(employee_id, is_active) WHERE is_active = 1;
CREATE INDEX idx_ba_country ON employee_bank_accounts(bank_country_code);

PRINT 'Module 10: Employee Banking - Created Successfully';
