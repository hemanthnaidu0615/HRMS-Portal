CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE organizations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    organization_id UNIQUEIDENTIFIER NULL,
    must_change_password BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE user_roles (
    user_id UNIQUEIDENTIFIER NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='superadmin')
INSERT INTO roles (name) VALUES ('superadmin');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='orgadmin')
INSERT INTO roles (name) VALUES ('orgadmin');

IF NOT EXISTS (SELECT 1 FROM roles WHERE name='employee')
INSERT INTO roles (name) VALUES ('employee');

CREATE TABLE password_reset_tokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE departments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE positions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    name VARCHAR(255) NOT NULL,
    seniority_level INT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE employees (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    department_id UNIQUEIDENTIFIER NULL,
    position_id UNIQUEIDENTIFIER NULL,
    reports_to UNIQUEIDENTIFIER NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'internal',
    client_id UNIQUEIDENTIFIER NULL,
    project_id UNIQUEIDENTIFIER NULL,
    contract_end_date DATE NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (position_id) REFERENCES positions(id),
    FOREIGN KEY (reports_to) REFERENCES employees(id)
);

CREATE TABLE employee_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    changed_field VARCHAR(255) NOT NULL,
    old_value VARCHAR(MAX),
    new_value VARCHAR(MAX),
    changed_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    changed_by UNIQUEIDENTIFIER,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE TABLE documents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    employee_id UNIQUEIDENTIFIER NOT NULL,
    uploaded_by UNIQUEIDENTIFIER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE document_requests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    requester_id UNIQUEIDENTIFIER NOT NULL,
    target_employee_id UNIQUEIDENTIFIER NOT NULL,
    message VARCHAR(1000) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    completed_at DATETIME2 NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (target_employee_id) REFERENCES employees(id)
);

CREATE TABLE permissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    code VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500) NULL
);

CREATE TABLE permission_groups (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500) NULL
);

CREATE TABLE group_permissions (
    group_id UNIQUEIDENTIFIER NOT NULL,
    permission_id UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (group_id, permission_id),
    FOREIGN KEY (group_id) REFERENCES permission_groups(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

CREATE TABLE employee_permission_groups (
    employee_id UNIQUEIDENTIFIER NOT NULL,
    group_id UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (employee_id, group_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (group_id) REFERENCES permission_groups(id)
);
