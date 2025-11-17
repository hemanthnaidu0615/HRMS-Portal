-- =====================================================
-- ENTERPRISE VENDOR & CLIENT MANAGEMENT SYSTEM
-- Multi-tier vendor support with full contract tracking
-- =====================================================

-- =====================================================
-- VENDOR MANAGEMENT
-- =====================================================

-- Vendors table: Companies that provide resources to your organization
CREATE TABLE vendors (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Vendor Information
    name VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    vendor_type VARCHAR(50) NOT NULL,  -- staffing, consulting, contractor, freelance

    -- Contact Information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),

    -- Business Details
    tax_id VARCHAR(50),
    business_registration_number VARCHAR(100),
    website VARCHAR(255),

    -- Contract Details
    contract_start_date DATE,
    contract_end_date DATE,
    contract_status VARCHAR(50) NOT NULL DEFAULT 'active',  -- active, expired, terminated, suspended
    contract_document_id UNIQUEIDENTIFIER,  -- Link to documents table

    -- Billing Configuration
    billing_type VARCHAR(50) NOT NULL,  -- hourly, daily, monthly, project, fixed
    default_billing_rate DECIMAL(10,2),
    billing_currency VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100),  -- Net 30, Net 60, etc.

    -- Multi-tier Support
    parent_vendor_id UNIQUEIDENTIFIER NULL,  -- For sub-vendor relationships
    tier_level INT DEFAULT 1,  -- 1 = direct vendor, 2 = sub-vendor, etc.

    -- Performance Tracking
    performance_rating DECIMAL(3,2),  -- 0.00 to 5.00
    total_resources_supplied INT DEFAULT 0,
    active_resources_count INT DEFAULT 0,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    is_preferred BIT NOT NULL DEFAULT 0,
    blacklisted BIT NOT NULL DEFAULT 0,
    blacklist_reason VARCHAR(500),

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (parent_vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- CLIENT MANAGEMENT
-- =====================================================

-- Clients table: End clients where employees are placed
CREATE TABLE clients (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,

    -- Client Information
    name VARCHAR(255) NOT NULL,
    client_code VARCHAR(50) UNIQUE NOT NULL,
    client_type VARCHAR(50) NOT NULL,  -- corporate, government, nonprofit, individual
    industry VARCHAR(100),

    -- Contact Information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),

    -- Business Details
    tax_id VARCHAR(50),
    website VARCHAR(255),

    -- Relationship Details
    relationship_start_date DATE,
    relationship_status VARCHAR(50) NOT NULL DEFAULT 'active',  -- active, inactive, prospect
    account_manager_id UNIQUEIDENTIFIER,  -- Employee managing this client

    -- Business Metrics
    total_active_projects INT DEFAULT 0,
    total_active_resources INT DEFAULT 0,
    lifetime_revenue DECIMAL(15,2) DEFAULT 0,

    -- Status
    is_active BIT NOT NULL DEFAULT 1,
    is_strategic BIT NOT NULL DEFAULT 0,  -- Strategic/key client flag

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (account_manager_id) REFERENCES employees(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- PROJECTS
-- =====================================================

-- Projects table: Client projects where resources are assigned
CREATE TABLE projects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    client_id UNIQUEIDENTIFIER NOT NULL,

    -- Project Information
    project_name VARCHAR(255) NOT NULL,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_type VARCHAR(50),  -- fixed-price, time-material, retainer
    description VARCHAR(2000),

    -- Timeline
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_duration_months INT,
    project_status VARCHAR(50) NOT NULL DEFAULT 'active',  -- active, completed, on-hold, cancelled

    -- Financial
    project_budget DECIMAL(15,2),
    billing_rate_type VARCHAR(50),  -- hourly, daily, monthly, fixed
    default_billing_rate DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',

    -- Management
    project_manager_id UNIQUEIDENTIFIER,

    -- Metrics
    total_allocated_resources INT DEFAULT 0,
    total_hours_logged DECIMAL(10,2) DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,

    -- Status
    is_billable BIT NOT NULL DEFAULT 1,

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIME2 NULL,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (project_manager_id) REFERENCES employees(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- VENDOR ASSIGNMENTS
-- =====================================================

-- Vendor assignments: Track which employees came through which vendors
CREATE TABLE vendor_assignments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    employee_id UNIQUEIDENTIFIER NOT NULL,
    vendor_id UNIQUEIDENTIFIER NOT NULL,

    -- Assignment Details
    assignment_type VARCHAR(50) NOT NULL,  -- direct, sub-contract, temporary, permanent
    assignment_start_date DATE NOT NULL,
    assignment_end_date DATE,
    assignment_status VARCHAR(50) NOT NULL DEFAULT 'active',  -- active, completed, terminated

    -- Project/Client Assignment (optional)
    client_id UNIQUEIDENTIFIER,
    project_id UNIQUEIDENTIFIER,

    -- Financial Terms
    billing_rate DECIMAL(10,2),
    billing_rate_type VARCHAR(50),  -- hourly, daily, monthly, fixed
    billing_currency VARCHAR(10) DEFAULT 'USD',
    markup_percentage DECIMAL(5,2),  -- Your org's markup on vendor rate

    -- Cost to your org from vendor
    vendor_cost_rate DECIMAL(10,2),

    -- Revenue from client (if applicable)
    client_billing_rate DECIMAL(10,2),

    -- Multi-tier tracking
    source_vendor_id UNIQUEIDENTIFIER,  -- If employee came via sub-vendor
    vendor_chain VARCHAR(500),  -- JSON array of vendor hierarchy

    -- Performance
    performance_rating DECIMAL(3,2),
    feedback_notes VARCHAR(2000),

    -- Termination details
    termination_date DATE,
    termination_reason VARCHAR(500),
    termination_initiated_by VARCHAR(50),  -- vendor, client, organization, employee

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (source_vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- VENDOR CONTRACTS
-- =====================================================

-- Vendor contracts: Detailed contract tracking
CREATE TABLE vendor_contracts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    vendor_id UNIQUEIDENTIFIER NOT NULL,

    -- Contract Details
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    contract_title VARCHAR(255) NOT NULL,
    contract_type VARCHAR(50) NOT NULL,  -- msa, sow, po, amendment

    -- Timeline
    effective_date DATE NOT NULL,
    expiration_date DATE,
    auto_renewal BIT DEFAULT 0,
    renewal_notice_days INT,

    -- Financial Terms
    contract_value DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100),

    -- Resources
    max_resources_allowed INT,

    -- Status
    contract_status VARCHAR(50) NOT NULL DEFAULT 'draft',  -- draft, active, expired, terminated, renewed

    -- Documents
    contract_document_id UNIQUEIDENTIFIER,
    signed_document_id UNIQUEIDENTIFIER,

    -- Approval
    approved_by UNIQUEIDENTIFIER,
    approved_at DATETIME2,

    -- Metadata
    notes VARCHAR(2000),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_by UNIQUEIDENTIFIER,

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =====================================================
-- VENDOR PERFORMANCE REVIEWS
-- =====================================================

-- Track vendor performance over time
CREATE TABLE vendor_performance_reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    vendor_id UNIQUEIDENTIFIER NOT NULL,

    -- Review Details
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_date DATE NOT NULL,
    reviewer_id UNIQUEIDENTIFIER NOT NULL,

    -- Ratings (1-5 scale)
    quality_rating DECIMAL(3,2),
    timeliness_rating DECIMAL(3,2),
    communication_rating DECIMAL(3,2),
    cost_effectiveness_rating DECIMAL(3,2),
    overall_rating DECIMAL(3,2),

    -- Metrics
    total_resources_period INT,
    successful_placements INT,
    failed_placements INT,
    average_time_to_fill_days DECIMAL(5,1),

    -- Feedback
    strengths VARCHAR(2000),
    areas_for_improvement VARCHAR(2000),
    action_items VARCHAR(2000),

    -- Recommendation
    recommendation VARCHAR(50),  -- continue, probation, terminate

    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),

    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_status ON vendors(is_active, contract_status);
CREATE INDEX idx_vendors_parent ON vendors(parent_vendor_id);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);

CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_clients_status ON clients(is_active, relationship_status);
CREATE INDEX idx_clients_manager ON clients(account_manager_id);

CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

CREATE INDEX idx_vendor_assignments_org ON vendor_assignments(organization_id);
CREATE INDEX idx_vendor_assignments_employee ON vendor_assignments(employee_id);
CREATE INDEX idx_vendor_assignments_vendor ON vendor_assignments(vendor_id);
CREATE INDEX idx_vendor_assignments_client ON vendor_assignments(client_id);
CREATE INDEX idx_vendor_assignments_project ON vendor_assignments(project_id);
CREATE INDEX idx_vendor_assignments_status ON vendor_assignments(assignment_status);

CREATE INDEX idx_vendor_contracts_org ON vendor_contracts(organization_id);
CREATE INDEX idx_vendor_contracts_vendor ON vendor_contracts(vendor_id);
CREATE INDEX idx_vendor_contracts_status ON vendor_contracts(contract_status);
CREATE INDEX idx_vendor_contracts_dates ON vendor_contracts(effective_date, expiration_date);

CREATE INDEX idx_vendor_reviews_org ON vendor_performance_reviews(organization_id);
CREATE INDEX idx_vendor_reviews_vendor ON vendor_performance_reviews(vendor_id);
CREATE INDEX idx_vendor_reviews_date ON vendor_performance_reviews(review_date DESC);

-- =====================================================
-- PERMISSIONS FOR VENDOR MANAGEMENT
-- =====================================================

-- Add vendor management permissions
INSERT INTO permissions (resource, action, scope, organization_id, description) VALUES
-- Vendors
('vendors', 'view', 'organization', NULL, 'View all vendors'),
('vendors', 'create', 'organization', NULL, 'Create new vendors'),
('vendors', 'edit', 'organization', NULL, 'Edit vendor information'),
('vendors', 'delete', 'organization', NULL, 'Delete vendors'),
('vendors', 'rate', 'organization', NULL, 'Rate vendor performance'),

-- Clients
('clients', 'view', 'organization', NULL, 'View all clients'),
('clients', 'create', 'organization', NULL, 'Create new clients'),
('clients', 'edit', 'organization', NULL, 'Edit client information'),
('clients', 'delete', 'organization', NULL, 'Delete clients'),

-- Projects
('projects', 'view', 'own', NULL, 'View own projects'),
('projects', 'view', 'organization', NULL, 'View all projects'),
('projects', 'create', 'organization', NULL, 'Create new projects'),
('projects', 'edit', 'organization', NULL, 'Edit project details'),
('projects', 'delete', 'organization', NULL, 'Delete projects'),

-- Vendor Assignments
('vendor-assignments', 'view', 'organization', NULL, 'View vendor assignments'),
('vendor-assignments', 'create', 'organization', NULL, 'Create vendor assignments'),
('vendor-assignments', 'edit', 'organization', NULL, 'Edit vendor assignments'),
('vendor-assignments', 'terminate', 'organization', NULL, 'Terminate vendor assignments'),

-- Vendor Contracts
('vendor-contracts', 'view', 'organization', NULL, 'View vendor contracts'),
('vendor-contracts', 'create', 'organization', NULL, 'Create vendor contracts'),
('vendor-contracts', 'edit', 'organization', NULL, 'Edit vendor contracts'),
('vendor-contracts', 'approve', 'organization', NULL, 'Approve vendor contracts');

-- Create permission group for Vendor Management
INSERT INTO permission_groups (name, description) VALUES
('Vendor & Client Management', 'Permissions for managing vendors, clients, projects, and assignments');

-- Assign permissions to vendor management group
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM permission_groups g, permissions p
WHERE g.name = 'Vendor & Client Management'
AND p.resource IN ('vendors', 'clients', 'projects', 'vendor-assignments', 'vendor-contracts');

-- Assign vendor management permissions to OrgAdmin role
DECLARE @OrgAdminRoleId INT = (SELECT id FROM roles WHERE name='orgadmin' AND is_system_role=1);

INSERT INTO role_permissions (role_id, permission_id)
SELECT @OrgAdminRoleId, id FROM permissions
WHERE resource IN ('vendors', 'clients', 'projects', 'vendor-assignments', 'vendor-contracts')
AND organization_id IS NULL;
