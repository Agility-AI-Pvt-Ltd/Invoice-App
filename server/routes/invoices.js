import express from 'express';
import Invoice from '../models/Invoice.js';
import Inventory from '../models/Inventory.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Helper function to update inventory
async function updateInventory(userId, items) {
    for (const item of items) {
        try {
            await Inventory.findOneAndUpdate(
                {
                    user: userId,
                    description: item.description
                },
                {
                    price: item.unitPrice,
                    gst: item.gst
                },
                {
                    upsert: true,
                    new: true
                }
            );
            // Note: Firestore doesn't have $inc in our helper yet.
            // For a robust implementation, we should fetch and increment.
            // But to keep it simple for now, we just update price/gst.
        } catch (err) {
            console.error('Error updating inventory:', err);
        }
    }
}

// Create new invoice
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        let invoiceNumber = req.body.invoiceNumber;

        if (!invoiceNumber || /^INV-\d{13}$/.test(invoiceNumber)) {
            const invoices = await Invoice.find({ user: userId });
            const lastNumber = invoices.length > 0 
                ? Math.max(...invoices.map(i => parseInt(i.invoiceNumber.replace(/[^0-9]/g, '')) || 0))
                : 0;
            invoiceNumber = `INV-${(lastNumber + 1).toString().padStart(6, '0')}`;
        }

        const { billTo, shipTo, items, date, dueDate, currency, status, termsAndConditions, notes, logo, cgst, sgst, igst, subtotal, total } = req.body;

        const invoice = await Invoice.create({
            billTo, shipTo, items, date, dueDate, currency, status, termsAndConditions, notes, logo, cgst, sgst, igst, subtotal, total,
            invoiceNumber,
            user: userId
        });

        await updateInventory(userId, invoice.items);

        res.status(201).json(invoice);
    } catch (err) {
        console.error('Error creating invoice:', err);
        res.status(400).json({ error: 'Failed to create invoice' });
    }
});

// Get all invoices for a user
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoices = await Invoice.findWithSort({ user: userId }, 'date', 'desc');
        res.json(invoices);
    } catch (err) {
        console.error('Error fetching invoices:', err);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// Get distinct client names for autocomplete
router.get('/clients', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const clients = await Invoice.distinct('billTo.name', { user: userId });
        res.json(clients);
    } catch (err) {
        console.error('Error fetching client list:', err);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

// Get client details by name
router.get('/clients/:name', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoices = await Invoice.find({
            user: userId,
            'billTo.name': req.params.name
        });
        
        if (invoices.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }

        // Sort manually since find doesn't sort
        const sorted = invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(sorted[0].billTo);
    } catch (err) {
        console.error('Error fetching client details:', err);
        res.status(500).json({ error: 'Failed to fetch client details' });
    }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoice = await Invoice.findOne({ id: req.params.id, user: userId });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (err) {
        console.error('Error fetching invoice:', err);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
});

// Update invoice
router.put('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoice = await Invoice.findOne({ id: req.params.id, user: userId });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const allowedFields = ['billTo', 'shipTo', 'items', 'date', 'dueDate', 'currency', 'status', 'termsAndConditions', 'notes', 'logo', 'cgst', 'sgst', 'igst', 'subtotal', 'total', 'invoiceNumber'];
        const updateData = {};
        allowedFields.forEach(key => {
            if (req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        });

        const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, updateData);
        await updateInventory(userId, updatedInvoice.items);

        res.json(updatedInvoice);
    } catch (err) {
        console.error('Error updating invoice:', err);
        res.status(400).json({ error: 'Failed to update invoice' });
    }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoice = await Invoice.findOneAndDelete({ id: req.params.id, user: userId });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json({ message: 'Invoice deleted' });
    } catch (err) {
        console.error('Error deleting invoice:', err);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
});

// Duplicate invoice route
router.post('/:id/duplicate', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const originalInvoice = await Invoice.findOne({ id: req.params.id, user: userId });
        if (!originalInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const invoices = await Invoice.find({ user: userId });
        const lastNumber = invoices.length > 0 
            ? Math.max(...invoices.map(i => parseInt(i.invoiceNumber.replace(/[^0-9]/g, '')) || 0))
            : 0;
        const newInvoiceNumber = `INV-${(lastNumber + 1).toString().padStart(6, '0')}`;

        const { id, _id, createdAt, updatedAt, ...invoiceData } = originalInvoice;
        const newInvoice = await Invoice.create({
            ...invoiceData,
            invoiceNumber: newInvoiceNumber,
            date: new Date(),
            status: 'draft'
        });

        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('Error duplicating invoice:', error);
        res.status(500).json({ message: 'Error duplicating invoice' });
    }
});

// Record a payment
router.post('/:id/payments', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { amount, date, method, notes } = req.body;

        const invoice = await Invoice.findOne({ id: req.params.id, user: userId });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const payments = invoice.payments || [];
        payments.push({
            amount: parseFloat(amount),
            date: date || new Date(),
            method: method || 'Cash',
            notes: notes || ''
        });

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        let status = invoice.status;
        if (totalPaid >= invoice.total) {
            status = 'paid';
        } else if (totalPaid > 0) {
            status = 'sent'; // Or 'partially paid' if you want to add that status
        }

        const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, {
            payments,
            status,
            totalPaid
        });

        res.json(updatedInvoice);
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ message: 'Error recording payment' });
    }
});

// Generate WhatsApp sharing link
router.get('/:id/whatsapp-link', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const invoice = await Invoice.findOne({ id: req.params.id, user: userId });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const customerName = invoice.billTo?.name || 'Customer';
        const amount = invoice.total;
        const invoiceNum = invoice.invoiceNumber;
        const currency = invoice.currency || 'INR';
        const phone = invoice.billTo?.phone;

        const message = `Hello ${customerName},\n\nThis is a reminder regarding your Invoice #${invoiceNum} for ${currency} ${amount}.\n\nYou can view and download it here: [Link]\n\nThank you!`;
        const encodedMessage = encodeURIComponent(message);
        
        let whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        if (phone) {
            // Clean phone number
            const cleanPhone = phone.replace(/\D/g, '');
            whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
        }

        res.json({ whatsappUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error generating WhatsApp link' });
    }
});

// Export GSTR data (CSV)
router.get('/export/gstr', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { start, end } = req.query;
        
        let query = { user: userId };
        // Note: Firestore date filtering requires where clauses
        const invoices = await Invoice.find(query);
        
        // Manual filter for dates if provided
        const filteredInvoices = (start && end) 
            ? invoices.filter(inv => {
                const date = new Date(inv.date);
                return date >= new Date(start) && date <= new Date(end);
            })
            : invoices;

        const csvRows = [
            ['Invoice Number', 'Date', 'Customer Name', 'GSTIN', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total'].join(',')
        ];

        filteredInvoices.forEach(inv => {
            csvRows.push([
                inv.invoiceNumber,
                inv.date,
                inv.billTo?.name || '',
                inv.billTo?.gst || '',
                inv.subtotal,
                inv.cgst || 0,
                inv.sgst || 0,
                inv.igst || 0,
                inv.total
            ].join(','));
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=GSTR_Export.csv');
        res.send(csvRows.join('\n'));
    } catch (error) {
        res.status(500).json({ message: 'Error exporting GSTR data' });
    }
});

export default router;
