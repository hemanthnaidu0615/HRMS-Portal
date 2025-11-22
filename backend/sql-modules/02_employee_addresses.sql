-- =====================================================
-- EMPLOYEE ADDRESSES MODULE
-- Flexible address storage - supports multiple addresses per employee
-- Country-agnostic design
-- =====================================================

CREATE TABLE employee_addresses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- ========================================
    -- ADDRESS TYPE & PRIORITY
    -- ========================================
    address_type VARCHAR(50) NOT NULL,                  -- current, permanent, mailing, work
    is_primary BIT DEFAULT 0,                           -- Primary address for correspondence

    -- ========================================
    -- ADDRESS FIELDS (Country-Agnostic)
    -- ========================================
    address_line1 VARCHAR(255) NOT NULL,                -- [REQUIRED] Street address
    address_line2 VARCHAR(255),                         -- [OPTIONAL] Apt, Suite, Unit, Building
    address_line3 VARCHAR(255),                         -- [OPTIONAL] Additional line (common in some countries)

    city VARCHAR(100) NOT NULL,                         -- [REQUIRED]
    state_province VARCHAR(100),                        -- [REQUIRED for most countries] State/Province/Region
    postal_code VARCHAR(20),                            -- [REQUIRED for most countries] ZIP/Postal code
    country VARCHAR(100) NOT NULL DEFAULT 'United States', -- [REQUIRED] Full country name
    country_code VARCHAR(3),                            -- [OPTIONAL] ISO 3166-1 alpha-2/3 code (US, IND, GBR)

    -- ========================================
    -- VERIFICATION & PROOF
    -- ========================================
    is_verified BIT DEFAULT 0,
    verified_at DATETIME2,
    verified_by UNIQUEIDENTIFIER,
    proof_document_id UNIQUEIDENTIFIER,                 -- Link to documents table

    -- ========================================
    -- VALIDITY
    -- ========================================
    effective_from DATE,                                -- When this address became active
    effective_to DATE,                                  -- When this address expired (for history)
    is_current BIT DEFAULT 1,                           -- Is this the current valid address

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
    CONSTRAINT chk_addr_type CHECK (address_type IN ('current', 'permanent', 'mailing', 'work', 'temporary'))
);

-- Only one primary address per employee
CREATE UNIQUE INDEX idx_employee_primary_address
    ON employee_addresses(employee_id)
    WHERE is_primary = 1 AND is_current = 1;

-- General indexes
CREATE INDEX idx_emp_addr_employee ON employee_addresses(employee_id);
CREATE INDEX idx_emp_addr_type ON employee_addresses(address_type);
CREATE INDEX idx_emp_addr_country ON employee_addresses(country_code);
CREATE INDEX idx_emp_addr_current ON employee_addresses(is_current);
