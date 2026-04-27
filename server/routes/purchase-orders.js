import express from 'express';
import PurchaseOrder from '../models/PurchaseOrder.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all POs
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const pos = await PurchaseOrder.findWithSort({ user: userId }, 'date', 'desc');
        res.json(pos);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch purchase orders' });
    }
});

// Create PO
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { vendor, items, date, total, poNumber } = req.body;

        const po = await PurchaseOrder.create({
            vendor, items, date, total, poNumber,
            user: userId,
            status: 'draft'
        });

        res.status(201).json(po);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create purchase order' });
    }
});

// Update PO
router.put('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, {
            ...req.body,
            user: userId
        });
        if (!po) return res.status(404).json({ error: 'PO not found' });
        res.json(po);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update PO' });
    }
});

export default router;
