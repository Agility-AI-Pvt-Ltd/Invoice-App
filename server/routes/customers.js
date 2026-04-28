import express from 'express';
import Invoice from '../models/Invoice.js';
import auth from '../middleware/auth.js';

const router = express.Router();

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get all unique customers from invoices
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const pageNum = Math.max(1, parseInt(req.query.page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (pageNum - 1) * limitNum;
        const search = req.query.search;

        // Fetch all invoices for the user to perform manual aggregation
        // In a high-traffic app, we would use a separate 'customers' collection
        let invoices = await Invoice.find({ user: userId });
        
        if (search) {
            const regex = new RegExp(escapeRegex(search), 'i');
            invoices = invoices.filter(inv => 
                regex.test(inv.billTo?.name || '') || 
                regex.test(inv.billTo?.email || '') || 
                regex.test(inv.billTo?.phone || '')
            );
        }

        // Group by customer name
        const customerMap = {};
        invoices.forEach(inv => {
            const name = inv.billTo?.name || 'Unknown';
            if (!customerMap[name]) {
                customerMap[name] = {
                    id: name,
                    customer: { name: name },
                    company: { name: name, email: inv.billTo?.email },
                    phone: inv.billTo?.phone,
                    lastInvoice: inv.date,
                    invoiceCount: 0,
                    totalAmount: 0,
                    status: 'Active',
                    balance: 0
                };
            }
            customerMap[name].invoiceCount += 1;
            customerMap[name].totalAmount += (inv.total || 0);
            customerMap[name].balance += (inv.total || 0);
            
            const invDate = inv.date?.toDate ? inv.date.toDate() : new Date(inv.date);
            const currentLastDate = customerMap[name].lastInvoice?.toDate ? customerMap[name].lastInvoice.toDate() : new Date(customerMap[name].lastInvoice);
            
            if (invDate > currentLastDate) {
                customerMap[name].lastInvoice = inv.date;
            }
        });

        let customers = Object.values(customerMap);
        
        // Sort and Page
        customers.sort((a, b) => new Date(b.lastInvoice) - new Date(a.lastInvoice));
        const total = customers.length;
        const paginatedCustomers = customers.slice(skip, skip + limitNum).map(c => ({
            ...c,
            lastInvoice: c.lastInvoice?.toDate ? c.lastInvoice.toDate().toISOString().split('T')[0] : new Date(c.lastInvoice).toISOString().split('T')[0],
            balance: `₹${c.balance}`
        }));

        res.json({
            success: true,
            data: paginatedCustomers,
            pagination: {
                page: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum
            }
        });

    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ success: false, message: 'Error fetching customers' });
    }
});

// Get customer by name
router.get('/search/:name', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const searchName = req.params.name.toLowerCase();
        
        const invoices = await Invoice.find({ user: userId });
        const invoice = invoices.find(inv => (inv.billTo?.name || '').toLowerCase().includes(searchName));

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, data: invoice.billTo });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error searching customer' });
    }
});

export default router;
