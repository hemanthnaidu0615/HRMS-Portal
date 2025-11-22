-- =====================================================
-- MODULE: CORE FOUNDATION
-- Order: 01 (No dependencies)
-- Description: Organizations, Users, Authentication
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 1 of 16
-- =====================================================

-- =====================================================
-- TABLE: organizations
-- Root multi-tenant entity
-- =====================================================
CREATE TABLE organizations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL,

    -- Business Details
    industry VARCHAR(100),
    organization_size VARCHAR(50) CHECK (organization_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),

    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'United States',
    country_code VARCHAR(3) NOT NULL DEFAULT 'USA',
    postal_code VARCHAR(20),

    -- Configuration
    timezone VARCHAR(100) DEFAULT 'UTC',
    default_currency VARCHAR(10) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    fiscal_year_start_month INT DEFAULT 1 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),

    -- Subscription & Limits
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled', 'expired')),
    subscription_start_date DATE,
    subscription_end_date DATE,
    max_employees INT,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,

    -- Constraints
    CONSTRAINT chk_org_email CHECK (email IS NULL OR email LIKE '%_@__%.__%'),
    CONSTRAINT chk_org_dates CHECK (subscription_end_date IS NULL OR subscription_start_date IS NULL OR subscription_end_date >= subscription_start_date)
);

-- =====================================================
-- TABLE: organization_modules
-- Feature flags per organization
-- =====================================================
CREATE TABLE organization_modules (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    module_name VARCHAR(50) NOT NULL CHECK (module_name IN (
        'core_hr', 'payroll', 'attendance', 'leave', 'recruitment',
        'performance', 'learning', 'expenses', 'assets', 'timesheets',
        'benefits', 'reports', 'analytics', 'integrations'
    )),
    is_enabled BIT NOT NULL DEFAULT 0,
    user_limit INT,
    expiry_date DATE,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    CONSTRAINT FK_org_modules_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT UQ_org_module UNIQUE (organization_id, module_name)
);

-- =====================================================
-- TABLE: users
-- Authentication entity
-- =====================================================
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    organization_id UNIQUEIDENTIFIER NULL,
    must_change_password BIT NOT NULL DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME2,
    last_login_at DATETIME2,
    last_password_change DATETIME2,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    CONSTRAINT FK_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT chk_users_email CHECK (email LIKE '%_@__%.__%')
);

-- =====================================================
-- TABLE: password_reset_tokens
-- Secure password reset
-- =====================================================
CREATE TABLE password_reset_tokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    used_at DATETIME2,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_prt_token UNIQUE (token)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_orgs_country ON organizations(country_code);
CREATE INDEX idx_orgs_status ON organizations(is_active);
CREATE INDEX idx_orgs_subscription ON organizations(subscription_status);
CREATE INDEX idx_org_modules_enabled ON organization_modules(organization_id, is_enabled);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_prt_user ON password_reset_tokens(user_id);
CREATE INDEX idx_prt_expires ON password_reset_tokens(expires_at) WHERE used = 0;

PRINT 'Module 01: Core Foundation - Created Successfully';
