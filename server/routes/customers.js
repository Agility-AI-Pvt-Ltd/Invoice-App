const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const authModule = require('../middleware/auth');
const auth = authModule && authModule.default ? authModule.default : authModule;

// Get all unique customers from invoices
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        // Build match query
        let matchQuery = { user: req.userId };
        if (search) {
            matchQuery.$or = [
                { 'billTo.name': { $regex: search, $options: 'i' } },
                { 'billTo.email': { $regex: search, $options: 'i' } },
                { 'billTo.phone': { $regex: search, $options: 'i' } }
            ];
        }

        // Aggregate to get unique customers with their latest invoice data
        const customers = await Invoice.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$billTo.name',
                    customer: { $first: '$billTo' },
                    company: { 
                        $first: {
                            name: '$billTo.name',
                            email: '$billTo.email'
                        }
                    },
                    phone: { $first: '$billTo.phone' },
                    lastInvoice: { $max: '$date' },
                    invoiceCount: { $sum: 1 },
                    totalAmount: { $sum: '$total' },
                    status: { $first: 'Active' }, // Default status
                    balance: { $sum: '$total' } // Assuming unpaid invoices contribute to balance
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    customer: {
                        name: '$customer.name'
                    },
                    company: '$company',
                    phone: '$phone',
                    status: '$status',
                    lastInvoice: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$lastInvoice'
                        }
                    },
                    balance: {
                        $concat: ['₹', { $toString: '$balance' }]
                    },
                    invoiceCount: '$invoiceCount',
                    totalAmount: '$totalAmount'
                }
            },
            { $sort: { lastInvoice: -1 } },
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) }
        ]);

        // Get total count for pagination
        const totalCustomers = await Invoice.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$billTo.name'
                }
            },
            { $count: 'total' }
        ]);

        const total = totalCustomers.length > 0 ? totalCustomers[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: customers,
            pagination: {
                page: parseInt(page),
                totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching customers',
            error: error.message 
        });
    }
});

// Get customer by name
router.get('/search/:name', auth, async (req, res) => {
    try {
        const { name } = req.params;
        
        const customer = await Invoice.findOne({
            user: req.userId,
            'billTo.name': { $regex: name, $options: 'i' }
        }).select('billTo');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: customer.billTo
        });

    } catch (error) {
        console.error('Error searching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching customer',
            error: error.message
        });
    }
});

// Create new customer (this creates an invoice with customer data)
router.post('/', auth, async (req, res) => {
    try {
        const { name, email, address, phone, gst, pan } = req.body;

        // Check if customer already exists
        const existingCustomer = await Invoice.findOne({
            user: req.userId,
            'billTo.name': name
        });

        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Customer already exists'
            });
        }

        // For now, we'll return success since customers are created via invoices
        // In a real app, you might want to create a placeholder invoice or separate customer collection
        res.json({
            success: true,
            message: 'Customer data received. Customer will be created when first invoice is generated.',
            data: {
                name,
                email,
                address,
                phone,
                gst,
                pan
            }
        });

    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating customer',
            error: error.message
        });
    }
});

export default router;
