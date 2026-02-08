const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { getDb } = require('../config/database');
const socketEvents = require('../config/socketEvents');

// Demo admin addresses
const ADMIN_ADDRESSES = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
];

// Helper to emit stats update
const emitStatsUpdate = async (io) => {
    const db = getDb();
    const stats = await db.getComplaintStats();
    io.emit(socketEvents.STATS_UPDATE, {
        stats,
        timestamp: new Date().toISOString()
    });
};

// Helper to emit dashboard update
const emitDashboardUpdate = async (io) => {
    const db = getDb();
    const stats = await db.getComplaintStats();
    const complaints = await db.getAllComplaints({});

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const resolvedThisWeek = complaints.filter(
        c => c.status === 'resolved' && new Date(c.updated_at) >= sevenDaysAgo
    ).length;

    io.emit(socketEvents.DASHBOARD_UPDATE, {
        stats: {
            totalComplaints: stats.total,
            pendingComplaints: stats.byStatus.pending || 0,
            resolvedThisWeek,
            resolutionRate: stats.total > 0
                ? Math.round((resolvedThisWeek / stats.total) * 100) + '%'
                : '0%'
        },
        recentComplaints: complaints.slice(0, 5).map(c => ({
            id: c.id,
            category: c.category,
            party_name: c.party_name,
            status: c.status,
            created_at: c.created_at
            // NOTE: No identity info - anonymous complaints
        })),
        timestamp: new Date().toISOString()
    });
};

// ============ VERIFY ADMIN SIGNATURE ============
router.post('/verify', async (req, res) => {
    try {
        const { address, signature, message } = req.body;

        if (!address || !signature || !message) {
            return res.status(400).json({
                success: false,
                error: 'Address, signature, and message are required'
            });
        }

        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({
                success: false,
                error: 'Invalid signature'
            });
        }

        const isAdmin = ADMIN_ADDRESSES.some(
            admin => admin.toLowerCase() === address.toLowerCase()
        );

        res.json({
            success: true,
            verified: true,
            isAdmin,
            address: recoveredAddress
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ GET ALL COMPLAINTS (Admin View) ============
router.get('/complaints', async (req, res) => {
    try {
        const db = getDb();
        const { status, category } = req.query;

        const complaints = await db.getAllComplaints({ status, category });

        const stats = {
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'pending').length,
            reviewing: complaints.filter(c => c.status === 'reviewing').length,
            resolved: complaints.filter(c => c.status === 'resolved').length
        };

        // Return complaints WITHOUT any identity information
        res.json({
            success: true,
            data: complaints.map(c => ({
                id: c.id,
                category: c.category,
                party_name: c.party_name,
                description: c.description,
                evidence: c.evidence,
                region_hash: c.region_hash,  // Only hashed region
                status: c.status,
                created_at: c.created_at,
                updated_at: c.updated_at
                // NO wallet address, NO submitter info - true anonymity
            })),
            stats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ BATCH UPDATE COMPLAINTS ============
router.patch('/complaints/batch', async (req, res) => {
    try {
        const db = getDb();
        const io = req.app.get('io');
        const { ids, status } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'ids array is required'
            });
        }

        const validStatuses = ['pending', 'reviewing', 'investigated', 'resolved', 'dismissed'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        let updatedCount = 0;
        const updatedComplaints = [];
        for (const id of ids) {
            const result = await db.updateComplaint(id, {
                status,
                updated_at: new Date().toISOString()
            });
            if (result) {
                updatedCount++;
                updatedComplaints.push(result);
            }
        }

        // Emit real-time events
        if (io) {
            io.emit(socketEvents.COMPLAINT_BATCH_UPDATE, {
                updatedComplaints,
                status,
                updatedCount
            });
            await emitStatsUpdate(io);
            await emitDashboardUpdate(io);
        }

        res.json({
            success: true,
            message: `Updated ${updatedCount} complaints`,
            updatedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ DASHBOARD SUMMARY ============
router.get('/dashboard', async (req, res) => {
    try {
        const db = getDb();
        const stats = await db.getComplaintStats();
        const complaints = await db.getAllComplaints({});

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const resolvedThisWeek = complaints.filter(
            c => c.status === 'resolved' && new Date(c.updated_at) >= sevenDaysAgo
        ).length;

        const recentComplaints = complaints.slice(0, 5).map(c => ({
            id: c.id,
            category: c.category,
            party_name: c.party_name,
            status: c.status,
            created_at: c.created_at
            // NO identity info shown
        }));

        res.json({
            success: true,
            data: {
                stats: {
                    totalComplaints: stats.total,
                    pendingComplaints: stats.byStatus.pending || 0,
                    resolvedThisWeek,
                    resolutionRate: stats.total > 0
                        ? Math.round((resolvedThisWeek / stats.total) * 100) + '%'
                        : '0%'
                },
                recentComplaints,
                categoryDistribution: Object.entries(stats.byCategory).map(([category, count]) => ({ category, count }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ GET USER STATS (Admin) ============
router.get('/users/stats', async (req, res) => {
    try {
        const db = getDb();
        const count = await db.getUserCount();
        const users = await db.getAllUsers();

        res.json({
            success: true,
            data: {
                totalUsers: count,
                verifiedUsers: users.filter(u => u.aadhaar_verified).length,
                recentUsers: users.slice(0, 5).map(u => ({
                    wallet_address: u.wallet_address,
                    name: u.name,
                    region: u.region,
                    created_at: u.created_at
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ EXPORT COMPLAINTS ============
router.get('/export', async (req, res) => {
    try {
        const db = getDb();
        const { format = 'json' } = req.query;

        const complaints = await db.getAllComplaints({});

        if (format === 'csv') {
            const headers = ['id', 'category', 'party_name', 'description', 'status', 'created_at'];
            const csv = [
                headers.join(','),
                ...complaints.map(c => headers.map(h => `"${c[h] || ''}"`).join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
            return res.send(csv);
        }

        res.json({
            success: true,
            data: complaints,
            exportedAt: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
