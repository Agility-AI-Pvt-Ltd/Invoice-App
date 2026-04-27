import express from 'express';
import Inventory from '../models/Inventory.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all inventory items for a user
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const inventory = await Inventory.findWithSort({ user: userId }, 'updatedAt', 'desc');
        res.json(inventory);
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// Get single inventory item
router.get('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const item = await Inventory.findOne({ id: req.params.id, user: userId });
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        console.error('Error fetching inventory item:', err);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

// Update inventory item
router.put('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { description, price, gst, totalQuantity } = req.body;
        
        const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, {
            description, price, gst, totalQuantity
        });

        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(updatedItem);
    } catch (err) {
        console.error('Error updating inventory item:', err);
        res.status(400).json({ error: 'Failed to update item' });
    }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const item = await Inventory.findOneAndDelete({ id: req.params.id, user: userId });
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'Item deleted' });
    } catch (err) {
        console.error('Error deleting inventory item:', err);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

export default router;