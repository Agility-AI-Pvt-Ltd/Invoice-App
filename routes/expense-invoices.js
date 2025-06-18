const express = require('express');
const router = express.Router();
const ExpenseInvoice = require('../models/ExpenseInvoice');
const auth = require('../middleware/auth');

// Get all expense invoices
router.get('/', auth, async (req, res) => {
    try {
        const invoices = await ExpenseInvoice.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
});

// Get last expense invoice
router.get('/last', auth, async (req, res) => {
    try {
        const lastInvoice = await ExpenseInvoice.findOne({ userId: req.user._id })
            .sort({ invoiceNumber: -1 });
        res.json(lastInvoice);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching last invoice' });
    }
});

// Get single expense invoice
router.get('/:id', auth, async (req, res) => {
    try {
        const invoice = await ExpenseInvoice.findOne({
            _id: req.params.id,
            userId: req.user._id
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
        const invoice = new ExpenseInvoice({
            ...req.body,
            userId: req.user._id
        });
        
        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error creating invoice' });
    }
});

// Update expense invoice
router.put('/:id', auth, async (req, res) => {
    try {
        const invoice = await ExpenseInvoice.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        
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
        const invoice = await ExpenseInvoice.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting invoice' });
    }
});

// Duplicate expense invoice
router.post('/:id/duplicate', auth, async (req, res) => {
    try {
        const originalInvoice = await ExpenseInvoice.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!originalInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Generate new invoice number
        const lastInvoice = await ExpenseInvoice.findOne({ userId: req.user._id })
            .sort({ invoiceNumber: -1 });
        const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.replace(/[^0-9]/g, '')) : 0;
        const newInvoiceNumber = `EXP-${(lastNumber + 1).toString().padStart(6, '0')}`;

        // Create new invoice with duplicated data
        const newInvoice = new ExpenseInvoice({
            ...originalInvoice.toObject(),
            _id: undefined,
            invoiceNumber: newInvoiceNumber,
            date: new Date(),
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(500).json({ message: 'Error duplicating invoice' });
    }
});

module.exports = router; 