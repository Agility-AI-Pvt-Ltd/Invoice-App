const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: Date,
    billTo: {
        name: {
            type: String,
            required: true
        },
        email: String,
        address: {
            type: String,
            required: true
        },
        gst: String,
        pan: String,
        phone: String
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
        description: {
            type: String,
            required: true
        },
        hsn: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        gst: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        amount: {
            type: Number,
            required: true
        }
    }],
    currency: {
        type: String,
        default: 'INR'
    },
    cgst: {
        type: Number,
        default: 0
    },
    sgst: {
        type: Number,
        default: 0
    },
    igst: {
        type: Number,
        default: 0
    },
    subtotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue'],
        default: 'draft'
    },
    termsAndConditions: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    logo: String,
    notes: String
});

// Update the updatedAt timestamp before saving
invoiceSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
