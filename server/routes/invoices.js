const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');

// Middleware to verify JWT token
const authModule = require('../middleware/auth');
const auth = authModule && authModule.default ? authModule.default : authModule;

// Helper function to update inventory
async function updateInventory(userId, items) {
    for (const item of items) {
        try {
            const inventoryItem = await Inventory.findOneAndUpdate(
                {
                    user: userId,
                    description: item.description
                },
                {
                    $inc: { totalQuantity: item.quantity },
                    price: item.unitPrice,
                    gst: item.gst
                },
                {
                    upsert: true,
                    new: true
                }
            );
        } catch (err) {
            console.error('Error updating inventory:', err);
        }
    }
}

// Create new invoice
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating new invoice with data:', req.body);
        
        // Preserve custom invoice number if provided
        let invoiceNumber = req.body.invoiceNumber;
        
        // Only auto-generate if no invoice number provided or it's a timestamp-based number
        if (!invoiceNumber || /^INV-\d{13}$/.test(invoiceNumber)) {
            const lastInvoice = await Invoice.findOne({ user: req.userId }).sort({ invoiceNumber: -1 });
            const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.replace(/[^0-9]/g, '')) : 0;
            invoiceNumber = `INV-${(lastNumber + 1).toString().padStart(6, '0')}`;
            console.log('Auto-generated invoice number:', invoiceNumber);
        } else {
            console.log('Using custom invoice number:', invoiceNumber);
        }
        
        const invoice = new Invoice({
            ...req.body,
            invoiceNumber: invoiceNumber, // Use preserved or generated number
            user: req.userId
        });
        await invoice.save();

        // Update inventory with new items
        await updateInventory(req.userId, invoice.items);

        console.log('Invoice created successfully:', invoice);
        res.status(201).json(invoice);
    } catch (err) {
        console.error('Error creating invoice:', err);
        res.status(400).json({
            error: err.message,
            details: err.errors
        });
    }
});

// Get all invoices for a user
router.get('/', auth, async (req, res) => {
    try {
        const invoices = await Invoice.find({ user: req.userId })
            .sort({ date: -1 }); // Sort by date descending
        res.json(invoices);
    } catch (err) {
        console.error('Error fetching invoices:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get distinct client names for autocomplete
router.get('/clients', auth, async (req, res) => {
    try {
        const clients = await Invoice.find({ user: req.userId })
            .distinct('billTo.name');
        res.json(clients);
    } catch (err) {
        console.error('Error fetching client list:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get client details by name
router.get('/clients/:name', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({
            user: req.userId,
            'billTo.name': req.params.name
        }).sort({ date: -1 });

        if (!invoice || !invoice.billTo) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.json(invoice.billTo);
    } catch (err) {
        console.error('Error fetching client details:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, user: req.userId });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (err) {
        console.error('Error fetching invoice:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update invoice
router.put('/:id', auth, async (req, res) => {
    try {
        console.log('Updating invoice with data:', req.body);
        const invoice = await Invoice.findOne({ _id: req.params.id, user: req.userId });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Store old items for inventory adjustment
        const oldItems = [...invoice.items];

        // Update all fields from request body
        Object.keys(req.body).forEach(key => {
            invoice[key] = req.body[key];
        });

        await invoice.save();

        // Update inventory with new items
        await updateInventory(req.userId, invoice.items);

        console.log('Invoice updated successfully:', invoice);
        res.json(invoice);
    } catch (err) {
        console.error('Error updating invoice:', err);
        res.status(400).json({
            error: err.message,
            details: err.errors
        });
    }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json({ message: 'Invoice deleted' });
    } catch (err) {
        console.error('Error deleting invoice:', err);
        res.status(500).json({ error: err.message });
    }
});

// Duplicate invoice route
router.post('/:id/duplicate', async (req, res) => {
    try {
        const originalInvoice = await Invoice.findById(req.params.id);
        if (!originalInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Generate new invoice number
        const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
        const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.replace(/[^0-9]/g, '')) : 0;
        const newInvoiceNumber = `INV-${(lastNumber + 1).toString().padStart(6, '0')}`;

        // Create new invoice with duplicated data
        const newInvoice = new Invoice({
            ...originalInvoice.toObject(),
            _id: undefined, // Remove the original ID
            invoiceNumber: newInvoiceNumber,
            date: new Date(),
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('Error duplicating invoice:', error);
        res.status(500).json({ message: 'Error duplicating invoice' });
    }
});

module.exports = router;
