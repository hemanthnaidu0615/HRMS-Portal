-- =====================================================
-- MODULE: EMPLOYEE TAX INFO
-- Order: 11 (Depends on: 06_employees_core)
-- Description: Country-specific tax information
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 11 of 16
-- =====================================================

CREATE TABLE employee_tax_info (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Tax Jurisdiction
    tax_country VARCHAR(100) NOT NULL,
    tax_country_code VARCHAR(3) NOT NULL,
    tax_year INT NOT NULL CHECK (tax_year BETWEEN 2000 AND 2100),
    tax_residency_status VARCHAR(50),
    is_tax_resident BIT NOT NULL DEFAULT 1,
    residency_start_date DATE,

    -- =====================================================
    -- US-SPECIFIC (W-4 Fields)
    -- =====================================================
    us_filing_status VARCHAR(50),
    us_multiple_jobs BIT,
    us_claim_dependents DECIMAL(10,2),
    us_other_income DECIMAL(10,2),
    us_deductions DECIMAL(10,2),
    us_extra_withholding DECIMAL(10,2),
    us_exempt_from_withholding BIT NOT NULL DEFAULT 0,
    us_exempt_reason VARCHAR(255),
    us_w4_submitted BIT NOT NULL DEFAULT 0,
    us_w4_submitted_date DATE,
    us_w4_form_year INT,
    -- State Tax
    us_state_code VARCHAR(5),
    us_state_filing_status VARCHAR(50),
    us_state_allowances INT,
    us_state_additional_withholding DECIMAL(10,2),
    us_local_tax_code VARCHAR(50),
    us_local_tax_rate DECIMAL(5,4),

    -- =====================================================
    -- UK-SPECIFIC
    -- =====================================================
    uk_tax_code VARCHAR(20),
    uk_is_cumulative BIT DEFAULT 1,
    uk_starter_declaration VARCHAR(5),
    uk_student_loan_plan VARCHAR(20),
    uk_postgrad_loan BIT NOT NULL DEFAULT 0,
    uk_p45_received BIT NOT NULL DEFAULT 0,
    uk_p45_previous_pay DECIMAL(12,2),
    uk_p45_previous_tax DECIMAL(12,2),

    -- =====================================================
    -- INDIA-SPECIFIC
    -- =====================================================
    ind_tax_regime VARCHAR(20),
    ind_pan_verified BIT NOT NULL DEFAULT 0,
    ind_hra_exemption_applicable BIT NOT NULL DEFAULT 0,
    ind_rent_paid_monthly DECIMAL(12,2),
    ind_metro_city BIT NOT NULL DEFAULT 0,
    ind_section_80c_declared DECIMAL(12,2),
    ind_section_80d_declared DECIMAL(12,2),
    ind_section_80g_declared DECIMAL(12,2),
    ind_section_24_declared DECIMAL(12,2),
    ind_other_deductions DECIMAL(12,2),
    ind_total_investment_declaration DECIMAL(12,2),
    ind_declaration_locked BIT NOT NULL DEFAULT 0,

    -- =====================================================
    -- CANADA-SPECIFIC (TD1 Fields)
    -- =====================================================
    can_province_code VARCHAR(5),
    can_td1_federal_submitted BIT NOT NULL DEFAULT 0,
    can_td1_provincial_submitted BIT NOT NULL DEFAULT 0,
    can_basic_personal_amount DECIMAL(12,2),
    can_total_claim_amount DECIMAL(12,2),
    can_additional_tax_deducted DECIMAL(12,2),
    can_reduced_ei BIT NOT NULL DEFAULT 0,
    can_cpp_exempt BIT NOT NULL DEFAULT 0,

    -- =====================================================
    -- AUSTRALIA-SPECIFIC (TFN Declaration)
    -- =====================================================
    aus_tfn_provided BIT NOT NULL DEFAULT 0,
    aus_tax_free_threshold BIT NOT NULL DEFAULT 1,
    aus_help_debt BIT NOT NULL DEFAULT 0,
    aus_sfss_debt BIT NOT NULL DEFAULT 0,
    aus_financial_supplement_debt BIT NOT NULL DEFAULT 0,
    aus_senior_offset BIT NOT NULL DEFAULT 0,
    aus_zone_offset VARCHAR(20),

    -- =====================================================
    -- GERMANY-SPECIFIC
    -- =====================================================
    deu_tax_class VARCHAR(10),
    deu_church_tax BIT NOT NULL DEFAULT 0,
    deu_church_denomination VARCHAR(50),
    deu_children_allowance DECIMAL(5,2),

    -- =====================================================
    -- GENERIC FIELDS
    -- =====================================================
    tax_bracket VARCHAR(50),
    estimated_annual_tax DECIMAL(12,2),
    year_to_date_tax_paid DECIMAL(12,2),
    annual_declaration_submitted BIT NOT NULL DEFAULT 0,
    declaration_submitted_date DATE,
    declaration_document_id UNIQUEIDENTIFIER,
    custom_tax_data NVARCHAR(MAX),

    -- Status
    is_current BIT NOT NULL DEFAULT 1,
    is_verified BIT NOT NULL DEFAULT 0,
    verified_by UNIQUEIDENTIFIER,
    verified_at DATETIME2,
    verification_notes VARCHAR(500),

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,

    CONSTRAINT FK_ti_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT FK_ti_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_ti_verified_by FOREIGN KEY (verified_by) REFERENCES users(id),
    CONSTRAINT FK_ti_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_ti_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),

    CONSTRAINT chk_ti_residency CHECK (tax_residency_status IN ('resident', 'non_resident', 'dual_status') OR tax_residency_status IS NULL),
    CONSTRAINT chk_ti_us_filing CHECK (us_filing_status IN ('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow') OR us_filing_status IS NULL),
    CONSTRAINT chk_ti_uk_student_loan CHECK (uk_student_loan_plan IN ('plan_1', 'plan_2', 'plan_4', 'plan_5', 'postgraduate') OR uk_student_loan_plan IS NULL),
    CONSTRAINT chk_ti_ind_regime CHECK (ind_tax_regime IN ('old_regime', 'new_regime') OR ind_tax_regime IS NULL),
    CONSTRAINT chk_ti_deu_tax_class CHECK (deu_tax_class IN ('I', 'II', 'III', 'IV', 'V', 'VI') OR deu_tax_class IS NULL)
);

-- Only one current tax record per employee per country per year
CREATE UNIQUE INDEX idx_emp_tax_unique ON employee_tax_info(employee_id, tax_country_code, tax_year)
    WHERE is_current = 1;

CREATE INDEX idx_ti_emp ON employee_tax_info(employee_id);
CREATE INDEX idx_ti_country ON employee_tax_info(tax_country_code);
CREATE INDEX idx_ti_year ON employee_tax_info(tax_year);
CREATE INDEX idx_ti_current ON employee_tax_info(employee_id, is_current) WHERE is_current = 1;
CREATE INDEX idx_ti_verified ON employee_tax_info(is_verified);

PRINT 'Module 11: Employee Tax Info - Created Successfully';
