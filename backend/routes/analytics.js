const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// Demo data for analytics (simulating blockchain data aggregation)
const DEMO_STATS = {
    overview: {
        totalParties: 12,
        totalDonors: 1547,
        totalDonations: '₹15,23,45,000',
        totalElections: 8,
        activeCampaigns: 3
    },
    donations: {
        thisMonth: '₹2,45,00,000',
        lastMonth: '₹1,89,00,000',
        growth: '+29.6%',
        averageAmount: '₹15,000'
    }
};

// ============ OVERVIEW STATS ============
router.get('/overview', async (req, res) => {
    try {
        const db = getDb();
        const stats = await db.getComplaintStats();
        const pending = await db.getComplaintsByStatus('pending');
        const userCount = await db.getUserCount();

        res.json({
            success: true,
            data: {
                ...DEMO_STATS.overview,
                totalComplaints: stats.total,
                pendingComplaints: pending.length,
                registeredUsers: userCount,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ DONATION TRENDS ============
router.get('/donations', (req, res) => {
    try {
        const monthlyData = [
            { month: 'Jan 2024', amount: 12500000, donors: 245 },
            { month: 'Feb 2024', amount: 18900000, donors: 312 },
            { month: 'Mar 2024', amount: 15600000, donors: 278 },
            { month: 'Apr 2024', amount: 22300000, donors: 398 },
            { month: 'May 2024', amount: 28700000, donors: 456 },
            { month: 'Jun 2024', amount: 24500000, donors: 421 }
        ];

        res.json({
            success: true,
            data: {
                monthly: monthlyData,
                summary: DEMO_STATS.donations,
                trend: 'increasing'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ PARTY-WISE BREAKDOWN ============
router.get('/parties', (req, res) => {
    try {
        const partyStats = [
            { name: 'Bharatiya Janata Party', donations: 45600000, donors: 567, share: '35%' },
            { name: 'Indian National Congress', donations: 32400000, donors: 423, share: '25%' },
            { name: 'Shiv Sena', donations: 18200000, donors: 234, share: '14%' },
            { name: 'Nationalist Congress Party', donations: 15800000, donors: 198, share: '12%' },
            { name: 'Others', donations: 18000000, donors: 125, share: '14%' }
        ];

        res.json({
            success: true,
            data: {
                parties: partyStats,
                totalParties: 12,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ REGIONAL BREAKDOWN ============
router.get('/regions', (req, res) => {
    try {
        const regionalStats = [
            { region: 'Maharashtra', donations: 38500000, percentage: 28 },
            { region: 'Gujarat', donations: 28700000, percentage: 21 },
            { region: 'Delhi', donations: 22100000, percentage: 16 },
            { region: 'Karnataka', donations: 18900000, percentage: 14 },
            { region: 'Tamil Nadu', donations: 15200000, percentage: 11 },
            { region: 'Others', donations: 13600000, percentage: 10 }
        ];

        res.json({
            success: true,
            data: {
                regions: regionalStats,
                topRegion: 'Maharashtra'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ COMPLAINT ANALYTICS ============
router.get('/complaints', async (req, res) => {
    try {
        const db = getDb();
        const stats = await db.getComplaintStats();

        const byStatus = Object.entries(stats.byStatus).map(([status, count]) => ({ status, count }));
        const byCategory = Object.entries(stats.byCategory).map(([category, count]) => ({ category, count }));

        // Get complaints from last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const allComplaints = await db.getAllComplaints({});
        const recentComplaints = allComplaints.filter(c => new Date(c.created_at) >= sevenDaysAgo);

        res.json({
            success: true,
            data: {
                byStatus,
                byCategory,
                last7Days: recentComplaints.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
