const { ethers } = require('ethers');

// Demo admin addresses (in production, fetch from blockchain contract)
const ADMIN_ADDRESSES = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
];

/**
 * Middleware to verify wallet signature for protected routes
 * Expects headers: x-wallet-address, x-signature, x-message
 */
const verifyWalletSignature = async (req, res, next) => {
    try {
        const address = req.headers['x-wallet-address'];
        const signature = req.headers['x-signature'];
        const message = req.headers['x-message'];

        if (!address || !signature || !message) {
            return res.status(401).json({
                success: false,
                error: 'Missing authentication headers'
            });
        }

        // Verify the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({
                success: false,
                error: 'Invalid signature'
            });
        }

        // Attach wallet info to request
        req.wallet = {
            address: recoveredAddress,
            isAdmin: ADMIN_ADDRESSES.some(
                admin => admin.toLowerCase() === recoveredAddress.toLowerCase()
            )
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Authentication failed: ' + error.message
        });
    }
};

/**
 * Middleware to require admin privileges
 */
const requireAdmin = (req, res, next) => {
    if (!req.wallet || !req.wallet.isAdmin) {
        return res.status(403).json({
            success: false,
            error: 'Admin privileges required'
        });
    }
    next();
};

/**
 * Optional authentication - doesn't fail if not present
 */
const optionalAuth = async (req, res, next) => {
    const address = req.headers['x-wallet-address'];
    const signature = req.headers['x-signature'];
    const message = req.headers['x-message'];

    if (address && signature && message) {
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
                req.wallet = {
                    address: recoveredAddress,
                    isAdmin: ADMIN_ADDRESSES.some(
                        admin => admin.toLowerCase() === recoveredAddress.toLowerCase()
                    )
                };
            }
        } catch (error) {
            // Ignore auth errors for optional auth
        }
    }
    next();
};

module.exports = {
    verifyWalletSignature,
    requireAdmin,
    optionalAuth,
    ADMIN_ADDRESSES
};
