-- =====================================================
-- MODULE: AUDIT LOGS
-- Order: 15 (Depends on: 01, 02)
-- Description: System-wide audit and logging
-- =====================================================
-- HRMS Portal Database Schema v3.0
-- Module 15 of 16
-- =====================================================

-- =====================================================
-- TABLE: audit_logs
-- Comprehensive system audit trail
-- =====================================================
CREATE TABLE audit_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER,

    -- Action Details
    action_type VARCHAR(50) NOT NULL,
    action_category VARCHAR(50),
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    entity_name VARCHAR(255),

    -- Change Data
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    changed_fields VARCHAR(1000),

    -- Actor
    performed_by UNIQUEIDENTIFIER,
    performed_by_email VARCHAR(255),
    performed_by_name VARCHAR(255),
    impersonated_by UNIQUEIDENTIFIER,

    -- Result
    status VARCHAR(20) NOT NULL,
    error_message NVARCHAR(MAX),
    error_code VARCHAR(50),

    -- Context
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    request_url VARCHAR(500),
    request_method VARCHAR(10),
    session_id VARCHAR(100),

    -- Additional Data
    metadata NVARCHAR(MAX),
    tags VARCHAR(500),

    -- Timing
    performed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    duration_ms INT,

    CONSTRAINT FK_al_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_al_performed_by FOREIGN KEY (performed_by) REFERENCES users(id),
    CONSTRAINT FK_al_impersonated_by FOREIGN KEY (impersonated_by) REFERENCES users(id),

    CONSTRAINT chk_al_action_type CHECK (action_type IN (
        'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'PASSWORD_RESET',
        'CREATE', 'READ', 'UPDATE', 'DELETE', 'BULK_CREATE', 'BULK_UPDATE', 'BULK_DELETE',
        'APPROVE', 'REJECT', 'SUBMIT', 'CANCEL',
        'EXPORT', 'IMPORT', 'DOWNLOAD', 'UPLOAD',
        'PERMISSION_GRANT', 'PERMISSION_REVOKE', 'ROLE_ASSIGN', 'ROLE_REVOKE',
        'CONFIG_CHANGE', 'SYSTEM_EVENT', 'INTEGRATION', 'API_CALL'
    )),
    CONSTRAINT chk_al_status CHECK (status IN ('SUCCESS', 'FAILED', 'PARTIAL', 'PENDING'))
);

-- =====================================================
-- TABLE: email_logs
-- Track all sent emails
-- =====================================================
CREATE TABLE email_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER,

    -- Recipient
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    cc_emails VARCHAR(1000),
    bcc_emails VARCHAR(1000),

    -- Email Details
    email_type VARCHAR(100) NOT NULL,
    template_name VARCHAR(100),
    subject VARCHAR(500) NOT NULL,
    body_preview VARCHAR(500),

    -- Status
    status VARCHAR(20) NOT NULL,
    error_message NVARCHAR(MAX),
    error_code VARCHAR(50),

    -- Delivery
    sent_at DATETIME2,
    delivered_at DATETIME2,
    opened_at DATETIME2,
    clicked_at DATETIME2,
    bounced_at DATETIME2,
    bounce_reason VARCHAR(500),

    -- Context
    related_entity_type VARCHAR(100),
    related_entity_id VARCHAR(255),
    triggered_by UNIQUEIDENTIFIER,

    -- Retry
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at DATETIME2,

    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_el_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_el_triggered_by FOREIGN KEY (triggered_by) REFERENCES users(id),

    CONSTRAINT chk_el_status CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'OPENED', 'CLICKED'))
);

-- =====================================================
-- TABLE: login_history
-- Track user logins
-- =====================================================
CREATE TABLE login_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER,

    -- Login Details
    login_type VARCHAR(20) NOT NULL DEFAULT 'password',
    login_status VARCHAR(20) NOT NULL,
    failure_reason VARCHAR(255),

    -- Context
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    location_city VARCHAR(100),
    location_country VARCHAR(100),

    -- Session
    session_id VARCHAR(100),
    session_started_at DATETIME2,
    session_ended_at DATETIME2,
    session_duration_minutes INT,

    -- Security
    is_suspicious BIT NOT NULL DEFAULT 0,
    suspicious_reason VARCHAR(255),
    mfa_used BIT NOT NULL DEFAULT 0,

    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_lh_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_lh_org FOREIGN KEY (organization_id) REFERENCES organizations(id),

    CONSTRAINT chk_lh_type CHECK (login_type IN ('password', 'sso', 'mfa', 'magic_link', 'api_key')),
    CONSTRAINT chk_lh_status CHECK (login_status IN ('SUCCESS', 'FAILED', 'LOCKED', 'EXPIRED', 'INVALID_MFA'))
);

-- =====================================================
-- TABLE: api_logs
-- Track API usage
-- =====================================================
CREATE TABLE api_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER,

    -- Request
    request_method VARCHAR(10) NOT NULL,
    request_url VARCHAR(500) NOT NULL,
    request_headers NVARCHAR(MAX),
    request_body_size INT,
    query_params VARCHAR(1000),

    -- Response
    response_status INT NOT NULL,
    response_body_size INT,

    -- Context
    user_id UNIQUEIDENTIFIER,
    api_key_id UNIQUEIDENTIFIER,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),

    -- Performance
    duration_ms INT,
    db_queries_count INT,
    db_query_time_ms INT,

    -- Timing
    requested_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_api_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT FK_api_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_al_org ON audit_logs(organization_id);
CREATE INDEX idx_al_performed_at ON audit_logs(performed_at DESC);
CREATE INDEX idx_al_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_al_action ON audit_logs(action_type);
CREATE INDEX idx_al_user ON audit_logs(performed_by);
CREATE INDEX idx_al_status ON audit_logs(status);

CREATE INDEX idx_el_org ON email_logs(organization_id);
CREATE INDEX idx_el_recipient ON email_logs(recipient_email);
CREATE INDEX idx_el_status ON email_logs(status);
CREATE INDEX idx_el_type ON email_logs(email_type);
CREATE INDEX idx_el_sent ON email_logs(sent_at DESC);

CREATE INDEX idx_lh_user ON login_history(user_id);
CREATE INDEX idx_lh_org ON login_history(organization_id);
CREATE INDEX idx_lh_date ON login_history(created_at DESC);
CREATE INDEX idx_lh_suspicious ON login_history(is_suspicious) WHERE is_suspicious = 1;

CREATE INDEX idx_api_org ON api_logs(organization_id);
CREATE INDEX idx_api_url ON api_logs(request_url);
CREATE INDEX idx_api_status ON api_logs(response_status);
CREATE INDEX idx_api_date ON api_logs(requested_at DESC);

PRINT 'Module 15: Audit Logs - Created Successfully';
