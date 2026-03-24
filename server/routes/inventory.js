const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Inventory = require('../models/Inventory');

// Middleware to verify JWT token
const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (!decoded.userId) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Get all inventory items for a user
router.get('/', auth, async (req, res) => {
    try {
        const inventory = await Inventory.find({ user: req.userId })
            .sort({ lastUpdated: -1 });
        res.json(inventory);
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get single inventory item
router.get('/:id', auth, async (req, res) => {
    try {
        const item = await Inventory.findOne({ _id: req.params.id, user: req.userId });
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        console.error('Error fetching inventory item:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update inventory item
router.put('/:id', auth, async (req, res) => {
    try {
        const item = await Inventory.findOne({ _id: req.params.id, user: req.userId });
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        Object.keys(req.body).forEach(key => {
            item[key] = req.body[key];
        });

        await item.save();
        res.json(item);
    } catch (err) {
        console.error('Error updating inventory item:', err);
        res.status(400).json({ error: err.message });
    }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
    try {
        const item = await Inventory.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'Item deleted' });
    } catch (err) {
        console.error('Error deleting inventory item:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 