const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// ============ GET ALL USERS ============
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const users = await db.getAllUsers();

        res.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ GET USER BY WALLET ============
router.get('/:wallet', async (req, res) => {
    try {
        const db = getDb();
        const user = await db.getUserByWallet(req.params.wallet);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const { verifyWalletSignature } = require('../middleware/auth');

// ============ CREATE/UPDATE USER ============
// PROTECTED: Requires valid signature from the wallet owner
router.post('/', verifyWalletSignature, async (req, res) => {
    try {
        const db = getDb();
        const { walletAddress, name, region, donorType, aadhaarVerified } = req.body;

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
        }

        // SECURITY CHECK: Ensure the signer matches the wallet being updated
        if (req.wallet.address.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized: You can only update your own profile'
            });
        }

        const user = await db.addUser({
            wallet_address: walletAddress,
            name,
            region,
            donor_type: donorType || 'individual',
            aadhaar_verified: aadhaarVerified || false
        });

        res.status(201).json({
            success: true,
            message: 'User created/updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ GET USER STATS ============
router.get('/stats/summary', async (req, res) => {
    try {
        const db = getDb();
        const count = await db.getUserCount();
        const users = await db.getAllUsers();

        // Group by region
        const byRegion = {};
        users.forEach(u => {
            const region = u.region || 'Unknown';
            byRegion[region] = (byRegion[region] || 0) + 1;
        });

        // Group by donor type
        const byType = {};
        users.forEach(u => {
            const type = u.donor_type || 'individual';
            byType[type] = (byType[type] || 0) + 1;
        });

        res.json({
            success: true,
            data: {
                total: count,
                byRegion,
                byType,
                verified: users.filter(u => u.aadhaar_verified).length
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
