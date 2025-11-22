-- =====================================================
-- EMPLOYEE BANK ACCOUNTS MODULE
-- Country-Agnostic Design - Works for ANY Country
-- =====================================================
-- Supports multiple bank accounts per employee
-- Handles different banking systems (SWIFT, IBAN, ACH, UPI, etc.)
-- =====================================================

CREATE TABLE employee_bank_accounts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- ========================================
    -- ACCOUNT TYPE & PRIORITY
    -- ========================================
    account_purpose VARCHAR(50) NOT NULL DEFAULT 'salary', -- salary, reimbursement, bonus
    is_primary BIT DEFAULT 0,                           -- Primary account for salary
    priority INT DEFAULT 1,                             -- If splitting salary

    -- ========================================
    -- BANK DETAILS (Universal Fields)
    -- ========================================
    bank_name VARCHAR(255) NOT NULL,                    -- [REQUIRED]
    bank_branch VARCHAR(255),                           -- Branch name
    bank_address VARCHAR(500),                          -- Branch address

    account_holder_name VARCHAR(255) NOT NULL,          -- [REQUIRED] Name as on account
    account_number VARCHAR(100) NOT NULL,               -- [REQUIRED] Account number (encrypted!)
    account_number_masked VARCHAR(20),                  -- Masked: ******1234
    account_type VARCHAR(50) DEFAULT 'checking',        -- checking, savings, current

    -- ========================================
    -- INTERNATIONAL BANK IDENTIFIERS
    -- Based on country, one or more will be used
    -- ========================================

    -- SWIFT/BIC (International transfers - worldwide)
    swift_code VARCHAR(11),                             -- 8 or 11 characters

    -- IBAN (Europe, Middle East, some others)
    iban VARCHAR(34),                                   -- International Bank Account Number

    -- Country-Specific Routing
    routing_number VARCHAR(20),                         -- USA: ABA Routing Number (9 digits)
    ifsc_code VARCHAR(15),                              -- India: IFSC Code
    sort_code VARCHAR(10),                              -- UK: Sort Code (6 digits)
    bsb_code VARCHAR(10),                               -- Australia: BSB Code (6 digits)
    transit_number VARCHAR(10),                         -- Canada: Transit Number
    institution_number VARCHAR(5),                      -- Canada: Institution Number
    clabe VARCHAR(20),                                  -- Mexico: CLABE (18 digits)

    -- ========================================
    -- COUNTRY & CURRENCY
    -- ========================================
    bank_country VARCHAR(100) NOT NULL DEFAULT 'United States',
    bank_country_code VARCHAR(3),                       -- ISO country code
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',        -- ISO currency code

    -- ========================================
    -- VERIFICATION
    -- ========================================
    verification_status VARCHAR(50) DEFAULT 'pending',  -- pending, verified, failed
    verified_at DATETIME2,
    verified_by UNIQUEIDENTIFIER,
    verification_method VARCHAR(50),                    -- micro_deposit, bank_statement, void_check
    verification_notes VARCHAR(500),

    -- Proof document
    proof_document_id UNIQUEIDENTIFIER,                 -- Void check, bank statement, etc.

    -- ========================================
    -- SALARY SPLIT (if multiple accounts)
    -- ========================================
    split_type VARCHAR(20),                             -- percentage, fixed_amount, remainder
    split_value DECIMAL(10,2),                          -- Percentage or fixed amount

    -- ========================================
    -- STATUS
    -- ========================================
    is_active BIT DEFAULT 1,
    deactivated_at DATETIME2,
    deactivation_reason VARCHAR(255),

    -- ========================================
    -- AUDIT
    -- ========================================
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (proof_document_id) REFERENCES documents(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),

    -- ========================================
    -- CONSTRAINTS
    -- ========================================
    CONSTRAINT chk_ba_account_purpose CHECK (account_purpose IN ('salary', 'reimbursement', 'bonus', 'all')),
    CONSTRAINT chk_ba_account_type CHECK (account_type IN ('checking', 'savings', 'current', 'salary')),
    CONSTRAINT chk_ba_verification_status CHECK (verification_status IN ('pending', 'verified', 'failed', 'needs_update')),
    CONSTRAINT chk_ba_split_type CHECK (split_type IN ('percentage', 'fixed_amount', 'remainder') OR split_type IS NULL)
);

-- Only one primary salary account per employee
CREATE UNIQUE INDEX idx_emp_primary_bank
    ON employee_bank_accounts(employee_id)
    WHERE is_primary = 1 AND is_active = 1 AND account_purpose = 'salary';

-- General indexes
CREATE INDEX idx_emp_bank_employee ON employee_bank_accounts(employee_id);
CREATE INDEX idx_emp_bank_status ON employee_bank_accounts(verification_status);
CREATE INDEX idx_emp_bank_active ON employee_bank_accounts(is_active);
CREATE INDEX idx_emp_bank_country ON employee_bank_accounts(bank_country_code);
