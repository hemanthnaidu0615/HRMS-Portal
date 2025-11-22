-- =====================================================
-- EMPLOYEE IDENTITY DOCUMENTS MODULE
-- Country-Agnostic Design - Works for ANY Country
-- =====================================================
-- Instead of hardcoding SSN, PAN, NI Number, etc.,
-- this uses a flexible structure that works globally.
-- =====================================================

-- ========================================
-- IDENTITY DOCUMENT TYPES (Reference Table)
-- ========================================
CREATE TABLE identity_document_types (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NULL,              -- NULL = system-wide, org-specific if set

    -- Document Type Details
    document_type_code VARCHAR(50) NOT NULL,            -- SSN, PAN, NI_NUMBER, TFN, SIN, etc.
    document_type_name VARCHAR(255) NOT NULL,           -- Social Security Number, PAN Card, etc.
    description VARCHAR(500),

    -- Country Association
    country_code VARCHAR(3),                            -- ISO country code (USA, IND, GBR, AUS, CAN)
    country_name VARCHAR(100),                          -- United States, India, United Kingdom

    -- Validation
    format_regex VARCHAR(255),                          -- Regex pattern for validation
    format_example VARCHAR(100),                        -- Example: XXX-XX-XXXX for SSN
    max_length INT,
    min_length INT,

    -- Requirements
    is_required_for_payroll BIT DEFAULT 0,              -- Must have for payroll processing
    is_required_for_tax BIT DEFAULT 0,                  -- Must have for tax filing
    is_required_for_work_auth BIT DEFAULT 0,            -- Required for work authorization
    is_government_issued BIT DEFAULT 1,
    has_expiry_date BIT DEFAULT 0,                      -- Does this document expire?

    -- Category
    category VARCHAR(50) NOT NULL,                      -- tax_id, national_id, work_auth, driving, other

    -- Status
    is_active BIT DEFAULT 1,
    is_system_type BIT DEFAULT 1,                       -- System-defined vs org-defined

    -- Audit
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),

    CONSTRAINT chk_idt_category CHECK (category IN ('tax_id', 'national_id', 'work_auth', 'driving', 'passport', 'visa', 'other'))
);

-- ========================================
-- SEED DATA: Common Identity Document Types
-- ========================================

-- UNITED STATES
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('SSN', 'Social Security Number', 'USA', 'United States', '^\d{3}-?\d{2}-?\d{4}$', 'XXX-XX-XXXX', 'tax_id', 1, 1, 0),
('ITIN', 'Individual Taxpayer Identification Number', 'USA', 'United States', '^\d{3}-?\d{2}-?\d{4}$', '9XX-XX-XXXX', 'tax_id', 1, 1, 0),
('DL_USA', 'Driver''s License (US)', 'USA', 'United States', NULL, 'Varies by state', 'driving', 0, 0, 1),
('EAD', 'Employment Authorization Document', 'USA', 'United States', NULL, 'XXX-XXX-XXXXX', 'work_auth', 0, 0, 1),
('GREEN_CARD', 'Permanent Resident Card', 'USA', 'United States', NULL, 'XXX-XXX-XXXXX', 'work_auth', 0, 0, 1);

-- INDIA
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('PAN', 'Permanent Account Number', 'IND', 'India', '^[A-Z]{5}[0-9]{4}[A-Z]$', 'ABCDE1234F', 'tax_id', 1, 1, 0),
('AADHAAR', 'Aadhaar Number', 'IND', 'India', '^\d{4}\s?\d{4}\s?\d{4}$', 'XXXX XXXX XXXX', 'national_id', 1, 0, 0),
('UAN', 'Universal Account Number (PF)', 'IND', 'India', '^\d{12}$', 'XXXXXXXXXXXX', 'tax_id', 1, 0, 0),
('DL_IND', 'Driver''s License (India)', 'IND', 'India', NULL, 'XX00 00000000000', 'driving', 0, 0, 1),
('VOTER_ID', 'Voter ID Card', 'IND', 'India', '^[A-Z]{3}[0-9]{7}$', 'ABC1234567', 'national_id', 0, 0, 0);

-- UNITED KINGDOM
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('NI_NUMBER', 'National Insurance Number', 'GBR', 'United Kingdom', '^[A-Z]{2}[0-9]{6}[A-Z]$', 'AB123456C', 'tax_id', 1, 1, 0),
('BRP', 'Biometric Residence Permit', 'GBR', 'United Kingdom', NULL, 'XXXXXXXXX', 'work_auth', 0, 0, 1),
('DL_UK', 'Driver''s License (UK)', 'GBR', 'United Kingdom', NULL, 'XXXXX000000XX0XX', 'driving', 0, 0, 1);

-- CANADA
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('SIN', 'Social Insurance Number', 'CAN', 'Canada', '^\d{3}-?\d{3}-?\d{3}$', 'XXX-XXX-XXX', 'tax_id', 1, 1, 0),
('PR_CARD', 'Permanent Resident Card', 'CAN', 'Canada', NULL, 'XXXXXXXXX', 'work_auth', 0, 0, 1);

-- AUSTRALIA
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('TFN', 'Tax File Number', 'AUS', 'Australia', '^\d{8,9}$', 'XXX XXX XXX', 'tax_id', 1, 1, 0),
('ABN', 'Australian Business Number', 'AUS', 'Australia', '^\d{11}$', 'XX XXX XXX XXX', 'tax_id', 0, 1, 0);

-- GERMANY
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('STEUER_ID', 'Tax Identification Number (Steuer-ID)', 'DEU', 'Germany', '^\d{11}$', 'XXXXXXXXXXX', 'tax_id', 1, 1, 0),
('SOZIAL', 'Social Security Number (Sozialversicherungsnummer)', 'DEU', 'Germany', NULL, 'XX XXXXXX X XXX', 'tax_id', 1, 0, 0);

-- UNIVERSAL (Any Country)
INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
('PASSPORT', 'Passport', NULL, NULL, NULL, 'Varies', 'passport', 0, 0, 1),
('WORK_VISA', 'Work Visa', NULL, NULL, NULL, 'Varies', 'visa', 0, 0, 1),
('WORK_PERMIT', 'Work Permit', NULL, NULL, NULL, 'Varies', 'work_auth', 0, 0, 1);


-- ========================================
-- EMPLOYEE IDENTITY DOCUMENTS
-- ========================================
CREATE TABLE employee_identity_documents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    document_type_id UNIQUEIDENTIFIER NOT NULL,         -- Reference to identity_document_types

    -- ========================================
    -- DOCUMENT DETAILS
    -- ========================================
    document_number VARCHAR(100) NOT NULL,              -- The actual ID number (encrypted in production!)
    document_number_masked VARCHAR(20),                 -- Masked version: ***-**-1234

    -- Issuing Details
    issuing_authority VARCHAR(255),                     -- SSA, Income Tax Dept, DVLA, etc.
    issuing_country VARCHAR(100),
    issuing_state VARCHAR(100),                         -- For state-issued documents like US DL

    -- Dates
    issue_date DATE,
    expiry_date DATE,                                   -- NULL if no expiry

    -- ========================================
    -- VERIFICATION STATUS
    -- ========================================
    verification_status VARCHAR(50) DEFAULT 'pending',  -- pending, verified, rejected, expired
    verified_at DATETIME2,
    verified_by UNIQUEIDENTIFIER,
    verification_notes VARCHAR(500),
    rejection_reason VARCHAR(500),

    -- ========================================
    -- DOCUMENT PROOF
    -- ========================================
    document_file_id UNIQUEIDENTIFIER,                  -- Link to uploaded document scan
    document_front_url VARCHAR(500),                    -- Front side image URL
    document_back_url VARCHAR(500),                     -- Back side image URL (if applicable)

    -- ========================================
    -- COMPLIANCE
    -- ========================================
    is_primary_tax_id BIT DEFAULT 0,                    -- Primary tax document for this country
    is_work_authorization BIT DEFAULT 0,                -- Used for work authorization
    used_for_i9 BIT DEFAULT 0,                          -- Used for I-9 verification (US)

    -- ========================================
    -- EXPIRY ALERTS
    -- ========================================
    expiry_reminder_sent BIT DEFAULT 0,
    expiry_reminder_date DATETIME2,

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
    FOREIGN KEY (document_type_id) REFERENCES identity_document_types(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (document_file_id) REFERENCES documents(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),

    -- ========================================
    -- CONSTRAINTS
    -- ========================================
    CONSTRAINT chk_eid_verification_status CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired', 'needs_update'))
);

-- Only one primary tax ID per employee per country
CREATE UNIQUE INDEX idx_emp_primary_tax_id
    ON employee_identity_documents(employee_id, issuing_country)
    WHERE is_primary_tax_id = 1;

-- General indexes
CREATE INDEX idx_emp_id_docs_employee ON employee_identity_documents(employee_id);
CREATE INDEX idx_emp_id_docs_type ON employee_identity_documents(document_type_id);
CREATE INDEX idx_emp_id_docs_status ON employee_identity_documents(verification_status);
CREATE INDEX idx_emp_id_docs_expiry ON employee_identity_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_emp_id_docs_country ON employee_identity_documents(issuing_country);
