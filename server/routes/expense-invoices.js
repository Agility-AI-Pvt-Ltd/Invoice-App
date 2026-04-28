import express from 'express';
import ExpenseInvoice from '../models/ExpenseInvoice.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all expense invoices
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoices = await ExpenseInvoice.findWithSort({ user: userId }, 'createdAt', 'desc');
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
});

// Get single expense invoice
router.get('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoice = await ExpenseInvoice.findOne({
            id: req.params.id,
            user: userId
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoice' });
    }
});

// Create expense invoice
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoice = await ExpenseInvoice.create({
            ...req.body,
            user: userId
        });
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error creating invoice' });
    }
});

// Update expense invoice
router.put('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoice = await ExpenseInvoice.findByIdAndUpdate(req.params.id, {
            ...req.body,
            user: userId
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error updating invoice' });
    }
});

// Delete expense invoice
router.delete('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoice = await ExpenseInvoice.findOneAndDelete({
            id: req.params.id,
            user: userId
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting invoice' });
    }
});

export default router;