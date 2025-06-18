const mongoose = require('mongoose');

const expenseInvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        required: true
    },
    dueDate: Date,
    currency: {
        type: String,
        required: true,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue'],
        default: 'draft'
    },
    billFrom: {
        name: String,
        address: String,
        gst: String,
        pan: String,
        phone: String,
        email: String
    },
    billTo: {
        name: String,
        address: String,
        gst: String,
        pan: String,
        phone: String,
        email: String
    },
    shipTo: {
        name: String,
        address: String,
        gst: String,
        pan: String,
        phone: String,
        email: String
    },
    items: [{
        description: String,
        hsn: String,
        quantity: Number,
        price: Number,
        gst: Number,
        discount: Number,
        total: Number
    }],
    subtotal: Number,
    cgst: Number,
    sgst: Number,
    igst: Number,
    total: Number,
    termsAndConditions: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ExpenseInvoice', expenseInvoiceSchema); 