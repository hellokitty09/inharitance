/**
 * ZKP Verification Middleware
 * 
 * In production, this would use snarkjs to verify the ZKP proof
 * For development, we provide a simplified verification flow
 */

const snarkjs = require('snarkjs');

/**
 * Verify ZKP proof for anonymous complaint submission
 * 
 * Expected proof structure:
 * {
 *   proof: { pi_a, pi_b, pi_c, protocol },
 *   publicSignals: [merkleRoot, regionHash]
 * }
 */
const verifyZKProof = async (req, res, next) => {
    try {
        const { zkpProof } = req.body;

        // Skip verification if no proof provided (for demo mode)
        if (!zkpProof) {
            req.zkpVerified = false;
            return next();
        }

        // In production, you would verify the proof against the verification key:

        const vKey = require('../zkp/verification_key.json');
        const isValid = await snarkjs.groth16.verify(
            vKey,
            zkpProof.publicSignals,
            zkpProof.proof
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ZKP proof'
            });
        }


        /* For development: simulate verification
        const isValidProof = zkpProof &&
            zkpProof.proof &&
            zkpProof.publicSignals &&
            zkpProof.publicSignals.length >= 2;

        if (!isValidProof) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ZKP proof structure'
            });
        }
        */

        req.zkpVerified = true;
        req.regionHash = zkpProof.publicSignals[1]; // regionHash from public signals

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'ZKP verification failed: ' + error.message
        });
    }
};

/**
 * Require valid ZKP proof for route access
 */
const requireZKProof = (req, res, next) => {
    if (!req.zkpVerified) {
        return res.status(403).json({
            success: false,
            error: 'Valid ZKP proof required for this action'
        });
    }
    next();
};

module.exports = {
    verifyZKProof,
    requireZKProof
};
