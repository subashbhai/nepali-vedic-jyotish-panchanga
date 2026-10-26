-- ============================================================================
-- BALANANDA VAIDIK SEWA — PRODUCTION DATABASE SCHEMA
-- PostgreSQL DDL with Unique Constraints, Foreign Keys & Performance Indexes
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64),
    username VARCHAR(64) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    address VARCHAR(255) NOT NULL,
    email VARCHAR(128),
    password_hash TEXT NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'user',
    role_name_nepali VARCHAR(128) DEFAULT 'साधारण प्रयोगकर्ता',
    user_category VARCHAR(32) NOT NULL DEFAULT 'visitor',
    account_status VARCHAR(32) NOT NULL DEFAULT 'active',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    mobile_verified BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_plan VARCHAR(128),
    subscription_start_at TIMESTAMPTZ,
    subscription_expires_at TIMESTAMPTZ,
    payment_amount_npr INT DEFAULT 0,
    payment_status VARCHAR(32) DEFAULT 'pending',
    remaining_days INT DEFAULT 0,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at_iso TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at_bs VARCHAR(32) DEFAULT '२०८१',
    last_login_iso TIMESTAMPTZ,
    last_updated_iso TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes on Users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_user_category ON users(user_category);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at_iso DESC);

-- 2. Client Purchase Leads (Applications) Table
CREATE TABLE IF NOT EXISTS client_purchase_leads (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    lead_number VARCHAR(64),
    full_name VARCHAR(128) NOT NULL,
    address VARCHAR(255),
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(128),
    whatsapp VARCHAR(20),
    device_fingerprint VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    plan_id VARCHAR(64) NOT NULL,
    plan_name_nepali VARCHAR(128) NOT NULL,
    plan_amount_npr INT NOT NULL DEFAULT 0,
    payment_method VARCHAR(32) NOT NULL DEFAULT 'cash',
    transaction_id VARCHAR(128),
    payment_verification_status VARCHAR(32) DEFAULT 'PENDING',
    submitted_at_iso TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at_bs VARCHAR(32) DEFAULT '२०८१',
    approved_at_iso TIMESTAMPTZ,
    approved_by VARCHAR(64),
    client_notes TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes on Purchase Leads
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON client_purchase_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_mobile ON client_purchase_leads(mobile);
CREATE INDEX IF NOT EXISTS idx_leads_status ON client_purchase_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON client_purchase_leads(submitted_at_iso DESC);

-- 3. Memberships Table
CREATE TABLE IF NOT EXISTS memberships (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    full_name VARCHAR(128),
    email VARCHAR(128),
    plan_id VARCHAR(64) NOT NULL,
    plan_name_nepali VARCHAR(128) NOT NULL,
    duration VARCHAR(32) NOT NULL DEFAULT '1_year',
    devices VARCHAR(32) DEFAULT 'both',
    amount_npr INT NOT NULL DEFAULT 0,
    payment_method VARCHAR(32) NOT NULL DEFAULT 'cash',
    payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    membership_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_PAYMENT',
    cash_verified BOOLEAN DEFAULT FALSE,
    cash_verified_by VARCHAR(64),
    cash_verified_at_iso TIMESTAMPTZ,
    submitted_at_iso TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at_bs VARCHAR(32) DEFAULT '२०८१',
    approved_by VARCHAR(64),
    approved_at_iso TIMESTAMPTZ,
    approved_at_bs VARCHAR(32),
    activated_at_iso TIMESTAMPTZ,
    expires_at_timestamp BIGINT,
    expires_at_iso TIMESTAMPTZ,
    expires_at_bs VARCHAR(32),
    included_services JSONB DEFAULT '["panchanga"]'::jsonb,
    admin_notes TEXT,
    renewal_count INT DEFAULT 0,
    history JSONB DEFAULT '[]'::jsonb,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes on Memberships
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_phone ON memberships(phone);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(membership_status);
CREATE INDEX IF NOT EXISTS idx_memberships_expires_at ON memberships(expires_at_iso);

-- 4. Service Licenses Table
CREATE TABLE IF NOT EXISTS service_licenses (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    username VARCHAR(64),
    phone VARCHAR(20) NOT NULL,
    full_name VARCHAR(128),
    email VARCHAR(128),
    service_key VARCHAR(64) NOT NULL,
    software_name VARCHAR(128),
    plan_name_nepali VARCHAR(128),
    amount_npr INT DEFAULT 0,
    payment_status VARCHAR(32) DEFAULT 'VERIFIED',
    payment_method VARCHAR(32) DEFAULT 'cash',
    transaction_id VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'unlocked',
    duration VARCHAR(32) DEFAULT '1_year',
    starts_at_iso TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    starts_at_bs VARCHAR(32) DEFAULT '२०८१',
    expires_at_timestamp BIGINT,
    expires_at_iso TIMESTAMPTZ,
    expires_at_bs VARCHAR(32),
    unlocked_by VARCHAR(64),
    unlocked_at_iso TIMESTAMPTZ,
    notes TEXT,
    updated_at_iso TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes on Service Licenses
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON service_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_phone ON service_licenses(phone);
CREATE INDEX IF NOT EXISTS idx_licenses_service_key ON service_licenses(service_key);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON service_licenses(status);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    subscription_id VARCHAR(64),
    amount_npr INT NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'NPR',
    payment_method VARCHAR(32) NOT NULL,
    payment_status VARCHAR(32) NOT NULL DEFAULT 'paid',
    transaction_reference VARCHAR(128),
    recorded_by VARCHAR(64) NOT NULL,
    notes TEXT,
    created_at_iso TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes on Payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at_iso DESC);

-- 6. Active Sessions Table
CREATE TABLE IF NOT EXISTS active_sessions (
    token VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    username VARCHAR(64) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(32) NOT NULL,
    user_category VARCHAR(32) NOT NULL DEFAULT 'visitor',
    created_at_iso TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at_iso TIMESTAMPTZ NOT NULL,
    last_active_iso TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes on Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON active_sessions(expires_at_iso);

-- 7. System Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    subscription_id VARCHAR(64),
    type VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    stage VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at_iso TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes on Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);

-- 8. Administrative Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    action VARCHAR(64) NOT NULL,
    performed_by VARCHAR(64) NOT NULL,
    target_id VARCHAR(64),
    details TEXT,
    timestamp_iso TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes on Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp_iso DESC);
