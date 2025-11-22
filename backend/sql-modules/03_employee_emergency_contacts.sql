-- =====================================================
-- EMPLOYEE EMERGENCY CONTACTS MODULE
-- Multiple emergency contacts per employee
-- =====================================================

CREATE TABLE employee_emergency_contacts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- ========================================
    -- PRIORITY
    -- ========================================
    priority INT NOT NULL DEFAULT 1,                    -- 1 = Primary, 2 = Secondary, etc.
    is_primary BIT DEFAULT 0,                           -- Mark as primary contact

    -- ========================================
    -- CONTACT DETAILS
    -- ========================================
    contact_name VARCHAR(255) NOT NULL,                 -- [REQUIRED]
    relationship VARCHAR(100) NOT NULL,                 -- [REQUIRED] spouse, parent, sibling, friend, etc.

    -- Phone numbers
    primary_phone VARCHAR(50) NOT NULL,                 -- [REQUIRED] Main contact number
    secondary_phone VARCHAR(50),                        -- [OPTIONAL] Alternative number
    phone_country_code VARCHAR(5),                      -- [OPTIONAL] +1, +91, +44

    -- Email
    email VARCHAR(255),                                 -- [OPTIONAL] Contact email

    -- Address (optional - for next of kin)
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),

    -- ========================================
    -- ADDITIONAL INFO
    -- ========================================
    notes VARCHAR(500),                                 -- Special instructions
    best_time_to_contact VARCHAR(100),                  -- Morning, Evening, Anytime
    speaks_languages VARCHAR(255),                      -- Languages the contact speaks

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
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),

    -- ========================================
    -- CONSTRAINTS
    -- ========================================
    CONSTRAINT chk_ec_relationship CHECK (relationship IN (
        'spouse', 'partner', 'parent', 'mother', 'father',
        'sibling', 'brother', 'sister', 'child', 'son', 'daughter',
        'grandparent', 'uncle', 'aunt', 'cousin', 'nephew', 'niece',
        'friend', 'colleague', 'neighbor', 'guardian', 'other'
    ))
);

-- Only one primary emergency contact per employee
CREATE UNIQUE INDEX idx_employee_primary_emergency
    ON employee_emergency_contacts(employee_id)
    WHERE is_primary = 1;

-- General indexes
CREATE INDEX idx_emp_ec_employee ON employee_emergency_contacts(employee_id);
CREATE INDEX idx_emp_ec_priority ON employee_emergency_contacts(employee_id, priority);
