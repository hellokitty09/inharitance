require('dotenv').config();
const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'inheritance',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Initialize database tables
const initDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
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

            CREATE TABLE IF NOT EXISTS complaints (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                category VARCHAR(100) NOT NULL,
                party_name VARCHAR(255),
                description TEXT NOT NULL,
                evidence TEXT,
                zkp_proof JSONB,
                region_hash VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS admin_logs (
                id SERIAL PRIMARY KEY,
                admin_address VARCHAR(42),
                action VARCHAR(100),
                target_id VARCHAR(255),
                details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database initialized successfully');
    } finally {
        client.release();
    }
};

// Database operations
const getDb = () => ({
    // ============ COMPLAINT OPERATIONS ============
    getAllComplaints: async (filters = {}) => {
        let query = 'SELECT * FROM complaints WHERE 1=1';
        const values = [];
        let paramCount = 0;

        if (filters.status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            values.push(filters.status);
        }
        if (filters.category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            values.push(filters.category);
        }
        if (filters.party) {
            paramCount++;
            query += ` AND party_name = $${paramCount}`;
            values.push(filters.party);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, values);
        return result.rows;
    },

    getComplaint: async (id) => {
        const result = await pool.query('SELECT * FROM complaints WHERE id = $1', [id]);
        return result.rows[0] || null;
    },

    addComplaint: async (complaint) => {
        const result = await pool.query(
            `INSERT INTO complaints (id, category, party_name, description, evidence, zkp_proof, region_hash, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                complaint.id,
                complaint.category,
                complaint.party_name,
                complaint.description,
                complaint.evidence,
                complaint.zkp_proof ? JSON.stringify(complaint.zkp_proof) : null,
                complaint.region_hash,
                complaint.status || 'pending',
                complaint.created_at || new Date().toISOString(),
                complaint.updated_at || new Date().toISOString()
            ]
        );
        return result.rows[0];
    },

    updateComplaint: async (id, updates) => {
        const setClauses = [];
        const values = [];
        let paramCount = 0;

        Object.entries(updates).forEach(([key, value]) => {
            paramCount++;
            setClauses.push(`${key} = $${paramCount}`);
            values.push(value);
        });

        paramCount++;
        values.push(id);

        const result = await pool.query(
            `UPDATE complaints SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );
        return result.rows[0] || null;
    },

    deleteComplaint: async (id) => {
        const result = await pool.query('DELETE FROM complaints WHERE id = $1', [id]);
        return result.rowCount > 0;
    },

    getComplaintCount: async () => {
        const result = await pool.query('SELECT COUNT(*) FROM complaints');
        return parseInt(result.rows[0].count);
    },

    getComplaintsByStatus: async (status) => {
        const result = await pool.query('SELECT * FROM complaints WHERE status = $1', [status]);
        return result.rows;
    },

    getComplaintStats: async () => {
        const statsQuery = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'reviewing') as reviewing,
                COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
                COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed
            FROM complaints
        `);

        const categoryQuery = await pool.query(`
            SELECT category, COUNT(*) as count FROM complaints GROUP BY category
        `);

        const stats = statsQuery.rows[0];
        const byCategory = {};
        categoryQuery.rows.forEach(row => {
            byCategory[row.category] = parseInt(row.count);
        });

        return {
            total: parseInt(stats.total),
            byStatus: {
                pending: parseInt(stats.pending),
                reviewing: parseInt(stats.reviewing),
                resolved: parseInt(stats.resolved),
                dismissed: parseInt(stats.dismissed)
            },
            byCategory
        };
    },

    // ============ USER OPERATIONS ============
    getAllUsers: async () => {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        return result.rows;
    },

    getUserByWallet: async (walletAddress) => {
        const result = await pool.query(
            'SELECT * FROM users WHERE LOWER(wallet_address) = LOWER($1)',
            [walletAddress]
        );
        return result.rows[0] || null;
    },

    addUser: async (user) => {
        const result = await pool.query(
            `INSERT INTO users (wallet_address, name, region, donor_type, aadhaar_verified, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             ON CONFLICT (wallet_address) DO UPDATE SET
                name = EXCLUDED.name,
                region = EXCLUDED.region,
                donor_type = EXCLUDED.donor_type,
                aadhaar_verified = EXCLUDED.aadhaar_verified,
                updated_at = NOW()
             RETURNING *`,
            [
                user.wallet_address || user.walletAddress,
                user.name,
                user.region,
                user.donor_type || user.donorType || 'individual',
                user.aadhaar_verified || user.aadhaarVerified || false
            ]
        );
        return result.rows[0];
    },

    getUserCount: async () => {
        const result = await pool.query('SELECT COUNT(*) FROM users');
        return parseInt(result.rows[0].count);
    },

    // ============ ADMIN LOG OPERATIONS ============
    addAdminLog: async (log) => {
        const result = await pool.query(
            `INSERT INTO admin_logs (admin_address, action, target_id, details)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [log.admin_address, log.action, log.target_id, JSON.stringify(log.details)]
        );
        return result.rows[0];
    },

    getAdminLogs: async (limit = 50) => {
        const result = await pool.query(
            'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT $1',
            [limit]
        );
        return result.rows;
    }
});

module.exports = { initDatabase, getDb, pool };
