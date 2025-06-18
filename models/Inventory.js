const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
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
    totalQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Create a compound index to ensure unique items per user
inventorySchema.index({ user: 1, description: 1 }, { unique: true });

// Update the lastUpdated timestamp before saving
inventorySchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema); 