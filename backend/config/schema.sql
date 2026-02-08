-- Inheritance Platform PostgreSQL Schema
-- Run this file to create all necessary tables

-- Users table (stores donor/user info synced from blockchain)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255),
    region VARCHAR(100),
    donor_type VARCHAR(20) DEFAULT 'individual',
    aadhaar_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table (anonymous - NO identity stored!)
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    party_name VARCHAR(255),
    description TEXT NOT NULL,
    evidence TEXT,
    zkp_proof JSONB,           -- ZKP proof data (NOT identity)
    region_hash VARCHAR(255),  -- Hashed region for anonymity
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Note: NO submitter_id, NO wallet_address - true anonymity!

-- Admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_address VARCHAR(42),
    action VARCHAR(100),
    target_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Political parties from scraper
CREATE TABLE IF NOT EXISTS political_parties (
    id SERIAL PRIMARY KEY,
    party_name VARCHAR(500) UNIQUE NOT NULL,
    pdf_link TEXT,
    source VARCHAR(255) DEFAULT 'eci.gov.in',
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region);
