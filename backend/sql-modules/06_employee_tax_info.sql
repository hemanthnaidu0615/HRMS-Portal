-- =====================================================
-- EMPLOYEE TAX INFORMATION MODULE
-- Country-Agnostic Design with Country-Specific Flexibility
-- =====================================================

CREATE TABLE employee_tax_info (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- ========================================
    -- TAX JURISDICTION
    -- ========================================
    tax_country VARCHAR(100) NOT NULL,                  -- Country for tax purposes
    tax_country_code VARCHAR(3) NOT NULL,               -- ISO country code
    tax_year INT NOT NULL,                              -- Fiscal/tax year

    -- ========================================
    -- TAX RESIDENCY STATUS
    -- ========================================
    tax_residency_status VARCHAR(50),                   -- resident, non_resident, dual_status
    is_tax_resident BIT DEFAULT 1,
    residency_start_date DATE,

    -- ========================================
    -- US-SPECIFIC (Stored if tax_country_code = 'USA')
    -- ========================================
    us_filing_status VARCHAR(50),                       -- single, married_filing_jointly, married_filing_separately, head_of_household
    us_allowances INT,                                  -- W-4 allowances (legacy)
    us_additional_withholding DECIMAL(10,2),            -- Additional withholding amount
    us_exempt_from_withholding BIT DEFAULT 0,
    us_w4_submitted BIT DEFAULT 0,
    us_w4_submitted_date DATE,

    -- State tax (US)
    us_state_code VARCHAR(5),                           -- State for state tax
    us_state_filing_status VARCHAR(50),
    us_state_allowances INT,
    us_local_tax_code VARCHAR(50),                      -- For local/city tax

    -- ========================================
    -- UK-SPECIFIC (Stored if tax_country_code = 'GBR')
    -- ========================================
    uk_tax_code VARCHAR(20),                            -- e.g., 1257L
    uk_is_cumulative BIT DEFAULT 1,                     -- Cumulative vs Week 1/Month 1
    uk_starter_declaration VARCHAR(5),                  -- A, B, or C
    uk_student_loan_plan VARCHAR(10),                   -- Plan 1, Plan 2, Plan 4, Postgrad

    -- ========================================
    -- INDIA-SPECIFIC (Stored if tax_country_code = 'IND')
    -- ========================================
    ind_tax_regime VARCHAR(20),                         -- old_regime, new_regime
    ind_hra_exemption_applicable BIT DEFAULT 0,
    ind_section_80c_declared DECIMAL(12,2),
    ind_section_80d_declared DECIMAL(12,2),
    ind_other_deductions DECIMAL(12,2),
    ind_total_investment_declaration DECIMAL(12,2),

    -- ========================================
    -- CANADA-SPECIFIC (Stored if tax_country_code = 'CAN')
    -- ========================================
    can_province_code VARCHAR(5),
    can_td1_federal_submitted BIT DEFAULT 0,
    can_td1_provincial_submitted BIT DEFAULT 0,
    can_total_claim_amount DECIMAL(12,2),

    -- ========================================
    -- AUSTRALIA-SPECIFIC (Stored if tax_country_code = 'AUS')
    -- ========================================
    aus_tax_free_threshold BIT DEFAULT 1,               -- Claiming tax-free threshold
    aus_help_debt BIT DEFAULT 0,                        -- Has HELP/HECS debt
    aus_sfss_debt BIT DEFAULT 0,                        -- Has SFSS debt

    -- ========================================
    -- GENERIC FIELDS (For any country)
    -- ========================================
    tax_bracket VARCHAR(50),                            -- Current tax bracket
    estimated_annual_tax DECIMAL(12,2),
    year_to_date_tax_paid DECIMAL(12,2),

    -- Tax declarations/forms submitted
    annual_declaration_submitted BIT DEFAULT 0,
    declaration_submitted_date DATE,
    declaration_document_id UNIQUEIDENTIFIER,

    -- ========================================
    -- CUSTOM FIELDS (JSON for any other country-specific data)
    -- ========================================
    custom_tax_data NVARCHAR(MAX),                      -- JSON for country-specific fields not covered above

    -- ========================================
    -- STATUS
    -- ========================================
    is_current BIT DEFAULT 1,                           -- Current year's record
    is_verified BIT DEFAULT 0,
    verified_by UNIQUEIDENTIFIER,
    verified_at DATETIME2,

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
    FOREIGN KEY (declaration_document_id) REFERENCES documents(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),

    -- ========================================
    -- CONSTRAINTS
    -- ========================================
    CONSTRAINT chk_ti_residency CHECK (tax_residency_status IN ('resident', 'non_resident', 'dual_status') OR tax_residency_status IS NULL),
    CONSTRAINT chk_ti_us_filing CHECK (us_filing_status IN ('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow') OR us_filing_status IS NULL),
    CONSTRAINT chk_ti_ind_regime CHECK (ind_tax_regime IN ('old_regime', 'new_regime') OR ind_tax_regime IS NULL)
);

-- Only one current tax record per employee per country per year
CREATE UNIQUE INDEX idx_emp_tax_unique
    ON employee_tax_info(employee_id, tax_country_code, tax_year)
    WHERE is_current = 1;

-- General indexes
CREATE INDEX idx_emp_tax_employee ON employee_tax_info(employee_id);
CREATE INDEX idx_emp_tax_country ON employee_tax_info(tax_country_code);
CREATE INDEX idx_emp_tax_year ON employee_tax_info(tax_year);
CREATE INDEX idx_emp_tax_current ON employee_tax_info(is_current);
