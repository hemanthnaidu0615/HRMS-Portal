-- =====================================================
-- MIGRATION SCRIPT: v1.0 to v2.0
-- Adds support for detailed employee profile, sub-entities, and onboarding
-- =====================================================

-- 1. Update Employees Table with New Fields
-- Wrap in checks to prevent errors if columns already exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[employees]') AND name = 'middle_name')
BEGIN
    ALTER TABLE employees ADD 
        middle_name VARCHAR(100),
        preferred_name VARCHAR(100),
        personal_email VARCHAR(255),
        phone_number VARCHAR(50),
        date_of_birth DATE,
        gender VARCHAR(20),
        pronouns VARCHAR(50),
        nationality VARCHAR(100),
        marital_status VARCHAR(20),
        blood_group VARCHAR(10),
        
        -- Employment Details
        work_location VARCHAR(255),
        work_arrangement VARCHAR(50) DEFAULT 'onsite',
        time_zone VARCHAR(100),
        designation VARCHAR(255),
        grade VARCHAR(50),
        level VARCHAR(50),
        
        -- Vendor/Client
        vendor_id UNIQUEIDENTIFIER,
        client_id UNIQUEIDENTIFIER,
        project_id UNIQUEIDENTIFIER,
        contract_start_date DATE,
        contract_end_date DATE,
        
        -- Probation
        probation_end_date DATE,
        is_on_probation BIT DEFAULT 1,
        confirmation_date DATE,
        original_hire_date DATE,
        probation_status VARCHAR(20),
        probation_start_date DATE,
        
        -- Notice
        notice_period_days INT DEFAULT 30,
        
        -- Profile
        profile_photo_url VARCHAR(500),
        linkedin_profile VARCHAR(255),
        github_profile VARCHAR(255),
        personal_website VARCHAR(255),
        
        -- Skills
        skills NVARCHAR(MAX),
        certifications NVARCHAR(MAX),
        languages_spoken NVARCHAR(MAX),
        bio VARCHAR(1000),
        tshirt_size VARCHAR(10),
        dietary_preferences VARCHAR(255),
        
        -- Exit
        resignation_date DATE,
        resignation_accepted_date DATE,
        last_working_date DATE,
        exit_type VARCHAR(50),
        exit_reason VARCHAR(100),
        exit_notes VARCHAR(2000),
        exit_interview_completed BIT DEFAULT 0,
        is_rehire_eligible BIT DEFAULT 1,
        notice_period_served BIT,
        
        -- Onboarding
        onboarding_status VARCHAR(50) DEFAULT 'not_started',
        onboarding_completed_at DATETIME2,
        onboarding_completed_by UNIQUEIDENTIFIER,
        
        -- Compensation
        basic_salary DECIMAL(12, 2),
        salary_currency VARCHAR(10) DEFAULT 'USD',
        pay_frequency VARCHAR(20) DEFAULT 'monthly',
        payment_method VARCHAR(50) DEFAULT 'bank_transfer',
        last_salary_review_date DATE,
        next_salary_review_date DATE;
END
GO

-- 2. Create Employee Addresses Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[employee_addresses]') AND type in (N'U'))
BEGIN
    CREATE TABLE employee_addresses (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        employee_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER NOT NULL,
        address_type VARCHAR(50) NOT NULL,
        is_primary BIT DEFAULT 0,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        address_line3 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state_province VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) NOT NULL DEFAULT 'United States',
        country_code VARCHAR(3),
        is_verified BIT DEFAULT 0,
        verified_at DATETIME2,
        verified_by UNIQUEIDENTIFIER,
        proof_document_id UNIQUEIDENTIFIER,
        effective_from DATE,
        effective_to DATE,
        is_current BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        created_by UNIQUEIDENTIFIER,
        updated_at DATETIME2,
        updated_by UNIQUEIDENTIFIER,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );
END
GO

-- 3. Create Employee Emergency Contacts Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[employee_emergency_contacts]') AND type in (N'U'))
BEGIN
    CREATE TABLE employee_emergency_contacts (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        employee_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER NOT NULL,
        priority INT NOT NULL DEFAULT 1,
        is_primary BIT DEFAULT 0,
        contact_name VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        relationship VARCHAR(100) NOT NULL,
        other_relationship VARCHAR(255),
        primary_phone VARCHAR(50) NOT NULL,
        secondary_phone VARCHAR(50),
        phone_country_code VARCHAR(5),
        email VARCHAR(255),
        address_line1 VARCHAR(255),
        city VARCHAR(100),
        state_province VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        notes VARCHAR(500),
        best_time_to_contact VARCHAR(100),
        speaks_languages VARCHAR(255),
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        created_by UNIQUEIDENTIFIER,
        updated_at DATETIME2,
        updated_by UNIQUEIDENTIFIER,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );
END
GO

-- 4. Create Identity Document Types Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[identity_document_types]') AND type in (N'U'))
BEGIN
    CREATE TABLE identity_document_types (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        organization_id UNIQUEIDENTIFIER NULL,
        document_type_code VARCHAR(50) NOT NULL,
        document_type_name VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        country_code VARCHAR(3),
        country_name VARCHAR(100),
        format_regex VARCHAR(255),
        format_example VARCHAR(100),
        max_length INT,
        min_length INT,
        is_required_for_payroll BIT DEFAULT 0,
        is_required_for_tax BIT DEFAULT 0,
        is_required_for_work_auth BIT DEFAULT 0,
        is_government_issued BIT DEFAULT 1,
        has_expiry_date BIT DEFAULT 0,
        category VARCHAR(50) NOT NULL,
        is_active BIT DEFAULT 1,
        is_system_type BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT SYSUTCDATETIME()
    );

    -- SEED DATA
    INSERT INTO identity_document_types (document_type_code, document_type_name, country_code, country_name, format_regex, format_example, category, is_required_for_payroll, is_required_for_tax, has_expiry_date) VALUES
    ('SSN', 'Social Security Number', 'USA', 'United States', '^\d{3}-?\d{2}-?\d{4}$', 'XXX-XX-XXXX', 'tax_id', 1, 1, 0),
    ('ITIN', 'Individual Taxpayer Identification Number', 'USA', 'United States', '^\d{3}-?\d{2}-?\d{4}$', '9XX-XX-XXXX', 'tax_id', 1, 1, 0),
    ('DL_USA', 'Driver''s License (US)', 'USA', 'United States', NULL, 'Varies by state', 'driving', 0, 0, 1),
    ('EAD', 'Employment Authorization Document', 'USA', 'United States', NULL, 'XXX-XXX-XXXXX', 'work_auth', 0, 0, 1),
    ('GREEN_CARD', 'Permanent Resident Card', 'USA', 'United States', NULL, 'XXX-XXX-XXXXX', 'work_auth', 0, 0, 1),
    ('PAN', 'Permanent Account Number', 'IND', 'India', '^[A-Z]{5}[0-9]{4}[A-Z]$', 'ABCDE1234F', 'tax_id', 1, 1, 0),
    ('AADHAAR', 'Aadhaar Number', 'IND', 'India', '^\d{4}\s?\d{4}\s?\d{4}$', 'XXXX XXXX XXXX', 'national_id', 1, 0, 0),
    ('UAN', 'Universal Account Number (PF)', 'IND', 'India', '^\d{12}$', 'XXXXXXXXXXXX', 'tax_id', 1, 0, 0),
    ('DL_IND', 'Driver''s License (India)', 'IND', 'India', NULL, 'XX00 00000000000', 'driving', 0, 0, 1),
    ('PASSPORT', 'Passport', NULL, NULL, NULL, 'Varies', 'passport', 0, 0, 1);
END
GO

-- 5. Create Employee Identity Documents Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[employee_identity_documents]') AND type in (N'U'))
BEGIN
    CREATE TABLE employee_identity_documents (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        employee_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER NOT NULL,
        document_type_id UNIQUEIDENTIFIER NOT NULL,
        document_number VARCHAR(100) NOT NULL,
        document_number_masked VARCHAR(20),
        issuing_authority VARCHAR(255),
        issuing_country VARCHAR(100),
        issuing_state VARCHAR(100),
        issue_date DATE,
        expiry_date DATE,
        verification_status VARCHAR(50) DEFAULT 'pending',
        verified_at DATETIME2,
        verified_by UNIQUEIDENTIFIER,
        verification_notes VARCHAR(500),
        rejection_reason VARCHAR(500),
        document_file_id UNIQUEIDENTIFIER,
        document_front_url VARCHAR(500),
        document_back_url VARCHAR(500),
        is_primary_tax_id BIT DEFAULT 0,
        is_work_authorization BIT DEFAULT 0,
        used_for_i9 BIT DEFAULT 0,
        expiry_reminder_sent BIT DEFAULT 0,
        expiry_reminder_date DATETIME2,
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        created_by UNIQUEIDENTIFIER,
        updated_at DATETIME2,
        updated_by UNIQUEIDENTIFIER,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
        FOREIGN KEY (document_type_id) REFERENCES identity_document_types(id)
    );
END
GO

-- 6. Create Employee Bank Accounts Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[employee_bank_accounts]') AND type in (N'U'))
BEGIN
    CREATE TABLE employee_bank_accounts (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        employee_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER NOT NULL,
        account_purpose VARCHAR(50) NOT NULL DEFAULT 'salary',
        is_primary BIT DEFAULT 0,
        priority INT DEFAULT 1,
        bank_name VARCHAR(255) NOT NULL,
        bank_branch VARCHAR(255),
        bank_address VARCHAR(500),
        account_holder_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        account_number_masked VARCHAR(20),
        account_type VARCHAR(50) DEFAULT 'checking',
        swift_code VARCHAR(11),
        iban VARCHAR(34),
        routing_number VARCHAR(20),
        ifsc_code VARCHAR(15),
        sort_code VARCHAR(10),
        bsb_code VARCHAR(10),
        transit_number VARCHAR(10),
        institution_number VARCHAR(5),
        clabe VARCHAR(20),
        bank_country VARCHAR(100) NOT NULL DEFAULT 'United States',
        bank_country_code VARCHAR(3),
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        verification_status VARCHAR(50) DEFAULT 'pending',
        verified_at DATETIME2,
        verified_by UNIQUEIDENTIFIER,
        verification_method VARCHAR(50),
        verification_notes VARCHAR(500),
        proof_document_id UNIQUEIDENTIFIER,
        split_type VARCHAR(20),
        split_value DECIMAL(10,2),
        is_active BIT DEFAULT 1,
        deactivated_at DATETIME2,
        deactivation_reason VARCHAR(255),
        created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        created_by UNIQUEIDENTIFIER,
        updated_at DATETIME2,
        updated_by UNIQUEIDENTIFIER,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );
END
GO

-- 7. Create Employee Tax Info Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[employee_tax_info]') AND type in (N'U'))
BEGIN
    CREATE TABLE employee_tax_info (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        employee_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER NOT NULL,
        tax_country VARCHAR(100) NOT NULL,
        tax_country_code VARCHAR(3) NOT NULL,
        tax_year INT NOT NULL,
        tax_residency_status VARCHAR(50),
        is_tax_resident BIT DEFAULT 1,
        residency_start_date DATE,
        
        -- US
        us_filing_status VARCHAR(50),
        us_allowances INT,
        us_additional_withholding DECIMAL(10,2),
        us_exempt_from_withholding BIT DEFAULT 0,
        us_w4_submitted BIT DEFAULT 0,
        us_w4_submitted_date DATE,
        us_state_code VARCHAR(5),
        us_state_filing_status VARCHAR(50),
        us_state_allowances INT,
        us_local_tax_code VARCHAR(50),
        
        -- India
        ind_tax_regime VARCHAR(20),
        ind_hra_exemption_applicable BIT DEFAULT 0,
        ind_section_80c_declared DECIMAL(12,2),
        ind_section_80d_declared DECIMAL(12,2),
        ind_other_deductions DECIMAL(12,2),
        ind_total_investment_declaration DECIMAL(12,2),
        
        -- Generic
        tax_bracket VARCHAR(50),
        estimated_annual_tax DECIMAL(12,2),
        year_to_date_tax_paid DECIMAL(12,2),
        annual_declaration_submitted BIT DEFAULT 0,
        declaration_submitted_date DATE,
        custom_tax_data NVARCHAR(MAX),
        is_current BIT DEFAULT 1,
        is_verified BIT DEFAULT 0,
        verified_by UNIQUEIDENTIFIER,
        verified_at DATETIME2,
        created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        created_by UNIQUEIDENTIFIER,
        updated_at DATETIME2,
        updated_by UNIQUEIDENTIFIER,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );
END
GO
