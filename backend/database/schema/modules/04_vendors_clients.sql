-- =====================================================
-- MODULE: VENDORS & CLIENTS
-- Order: 04 (Depends on: 01, 02)
-- Description: External parties management
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 4 of 16
-- =====================================================

-- =====================================================
-- TABLE: vendors
-- Contractor suppliers
-- =====================================================
CREATE TABLE vendors (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    parent_vendor_id UNIQUEIDENTIFIER,

    -- Basic Info
    name VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(50) NOT NULL,
    vendor_type VARCHAR(50) NOT NULL CHECK (vendor_type IN ('staffing_agency', 'consulting_firm', 'freelancer_platform', 'direct_contractor', 'service_provider', 'other')),

    -- Contact
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    country_code VARCHAR(3),
    postal_code VARCHAR(20),

    -- Business Details
    tax_id VARCHAR(50),
    business_registration_number VARCHAR(100),
    website VARCHAR(255),

    -- Contract
    contract_start_date DATE,
    contract_end_date DATE,
    contract_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (contract_status IN ('draft', 'active', 'expired', 'terminated', 'pending_renewal')),
    contract_document_id UNIQUEIDENTIFIER,

    -- Billing
    billing_type VARCHAR(50) NOT NULL CHECK (billing_type IN ('hourly', 'monthly', 'fixed', 'milestone', 'commission')),
    default_billing_rate DECIMAL(10,2),
    billing_currency VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100),

    -- Metrics
    tier_level INT DEFAULT 1 CHECK (tier_level BETWEEN 1 AND 5),
    performance_rating DECIMAL(3,2) CHECK (performance_rating BETWEEN 0 AND 5),
    total_resources_supplied INT DEFAULT 0,
    active_resources_count INT DEFAULT 0,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    is_preferred BIT NOT NULL DEFAULT 0,
    blacklisted BIT NOT NULL DEFAULT 0,
    blacklist_reason VARCHAR(500),
    blacklisted_at DATETIME2,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    CONSTRAINT FK_vendors_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_vendors_parent FOREIGN KEY (parent_vendor_id) REFERENCES vendors(id),
    CONSTRAINT FK_vendors_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_vendors_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT UQ_vendor_code_org UNIQUE (organization_id, vendor_code)
);

-- =====================================================
-- TABLE: clients
-- Customer organizations
-- =====================================================
CREATE TABLE clients (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Basic Info
    name VARCHAR(255) NOT NULL,
    client_code VARCHAR(50) NOT NULL,
    client_type VARCHAR(50) NOT NULL CHECK (client_type IN ('enterprise', 'mid_market', 'small_business', 'startup', 'government', 'nonprofit', 'individual')),
    industry VARCHAR(100),

    -- Contact
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    country_code VARCHAR(3),
    postal_code VARCHAR(20),

    -- Business Details
    tax_id VARCHAR(50),
    website VARCHAR(255),

    -- Relationship
    relationship_start_date DATE,
    relationship_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (relationship_status IN ('prospect', 'active', 'inactive', 'churned', 'on_hold')),
    account_manager_id UNIQUEIDENTIFIER,

    -- Metrics
    total_active_projects INT DEFAULT 0,
    total_active_resources INT DEFAULT 0,
    lifetime_revenue DECIMAL(15,2) DEFAULT 0,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    is_strategic BIT NOT NULL DEFAULT 0,

    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2,

    CONSTRAINT FK_clients_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_clients_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_clients_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT UQ_client_code_org UNIQUE (organization_id, client_code)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);
CREATE INDEX idx_vendors_status ON vendors(contract_status);
CREATE INDEX idx_vendors_active ON vendors(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_clients_type ON clients(client_type);
CREATE INDEX idx_clients_status ON clients(relationship_status);
CREATE INDEX idx_clients_active ON clients(is_active) WHERE deleted_at IS NULL;

PRINT 'Module 04: Vendors & Clients - Created Successfully';
