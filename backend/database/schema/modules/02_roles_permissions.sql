-- =====================================================
-- MODULE: ROLES & PERMISSIONS
-- Order: 02 (Depends on: 01_core_foundation)
-- Description: RBAC System
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 2 of 16
-- =====================================================

-- =====================================================
-- TABLE: roles
-- System and custom roles
-- =====================================================
CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization_id UNIQUEIDENTIFIER NULL,
    is_system_role BIT NOT NULL DEFAULT 0,
    description VARCHAR(500),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2,
    CONSTRAINT FK_roles_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT UQ_role_per_org UNIQUE (name, organization_id)
);

-- =====================================================
-- TABLE: permissions
-- Granular permission definitions
-- =====================================================
CREATE TABLE permissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('own', 'team', 'department', 'organization', 'global')),
    organization_id UNIQUEIDENTIFIER NULL,
    description VARCHAR(500),
    CONSTRAINT FK_perms_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT UQ_permission UNIQUE (resource, action, scope, organization_id)
);

-- =====================================================
-- TABLE: role_permissions
-- Role-permission mappings
-- =====================================================
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id UNIQUEIDENTIFIER NOT NULL,
    granted_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    granted_by UNIQUEIDENTIFIER,
    CONSTRAINT PK_role_perms PRIMARY KEY (role_id, permission_id),
    CONSTRAINT FK_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT FK_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT FK_rp_granted_by FOREIGN KEY (granted_by) REFERENCES users(id)
);

-- =====================================================
-- TABLE: user_roles
-- User-role assignments
-- =====================================================
CREATE TABLE user_roles (
    user_id UNIQUEIDENTIFIER NOT NULL,
    role_id INT NOT NULL,
    assigned_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    assigned_by UNIQUEIDENTIFIER,
    expires_at DATETIME2,
    CONSTRAINT PK_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT FK_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT FK_ur_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- =====================================================
-- TABLE: permission_groups
-- Reusable permission bundles
-- =====================================================
CREATE TABLE permission_groups (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    organization_id UNIQUEIDENTIFIER,
    is_system_group BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    created_by UNIQUEIDENTIFIER,
    CONSTRAINT FK_pg_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_pg_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT UQ_pg_name_org UNIQUE (name, organization_id)
);

-- =====================================================
-- TABLE: group_permissions
-- Permission group memberships
-- =====================================================
CREATE TABLE group_permissions (
    group_id UNIQUEIDENTIFIER NOT NULL,
    permission_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT PK_group_perms PRIMARY KEY (group_id, permission_id),
    CONSTRAINT FK_gp_group FOREIGN KEY (group_id) REFERENCES permission_groups(id) ON DELETE CASCADE,
    CONSTRAINT FK_gp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_roles_org ON roles(organization_id);
CREATE INDEX idx_roles_system ON roles(is_system_role);
CREATE INDEX idx_perms_resource ON permissions(resource);
CREATE INDEX idx_perms_org ON permissions(organization_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_pg_org ON permission_groups(organization_id);

PRINT 'Module 02: Roles & Permissions - Created Successfully';
