const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');
const socketEvents = require('../config/socketEvents');

// Helper to emit stats update
const emitStatsUpdate = async (io) => {
    const db = getDb();
    const stats = await db.getComplaintStats();
    io.emit(socketEvents.STATS_UPDATE, {
        stats,
        timestamp: new Date().toISOString()
    });
};

// ============ GET ALL COMPLAINTS ============
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const { status, category, party, limit = 50, offset = 0 } = req.query;

        let complaints = await db.getAllComplaints({ status, category, party });
        const total = complaints.length;

        // Apply pagination
        complaints = complaints.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.json({
            success: true,
            data: complaints,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ GET COMPLAINT STATS (before :id to avoid conflict) ============
router.get('/stats/summary', async (req, res) => {
    try {
        const db = getDb();
        const stats = await db.getComplaintStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ GET SINGLE COMPLAINT ============
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const complaint = await db.getComplaint(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }

        res.json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ SUBMIT NEW COMPLAINT (ANONYMOUS) ============
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const io = req.app.get('io');
        const { category, partyName, description, evidence, zkpProof, regionHash } = req.body;

        // Validation
        if (!category || !description) {
            return res.status(400).json({
                success: false,
                error: 'Category and description are required'
            });
        }

        const now = new Date().toISOString();
        const complaint = {
            id: uuidv4(),
            category,
            party_name: partyName || null,
            description,
            evidence: evidence || null,
            zkp_proof: zkpProof || null,  // Store proof, NOT identity
            region_hash: regionHash || null,  // Hashed, not plaintext
            status: 'pending',
            created_at: now,
            updated_at: now
        };
        // NOTE: NO wallet address, NO user ID - true anonymity!

        const savedComplaint = await db.addComplaint(complaint);

        // Emit real-time events for admin dashboard
        if (io) {
            io.emit(socketEvents.COMPLAINT_NEW, savedComplaint);
            await emitStatsUpdate(io);
        }

        res.status(201).json({
            success: true,
            message: 'Complaint submitted anonymously',
            data: {
                id: savedComplaint.id,
                status: savedComplaint.status,
                created_at: savedComplaint.created_at
            }
            // Don't return full complaint to avoid leaking any data
        });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ UPDATE COMPLAINT STATUS ============
router.patch('/:id/status', async (req, res) => {
    try {
        const db = getDb();
        const io = req.app.get('io');
        const { status } = req.body;
        const validStatuses = ['pending', 'reviewing', 'investigated', 'resolved', 'dismissed'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        const complaint = await db.getComplaint(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }

        const updated = await db.updateComplaint(req.params.id, {
            status,
            updated_at: new Date().toISOString()
        });

        // Emit real-time events
        if (io) {
            io.emit(socketEvents.COMPLAINT_UPDATE, updated);
            await emitStatsUpdate(io);
        }

        res.json({
            success: true,
            message: 'Complaint status updated',
            data: updated
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ DELETE COMPLAINT ============
router.delete('/:id', async (req, res) => {
    try {
        const db = getDb();
        const io = req.app.get('io');
        const complaint = await db.getComplaint(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }

        await db.deleteComplaint(req.params.id);

        // Emit real-time events
        if (io) {
            io.emit(socketEvents.COMPLAINT_DELETE, { id: req.params.id });
            await emitStatsUpdate(io);
        }

        res.json({
            success: true,
            message: 'Complaint deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
