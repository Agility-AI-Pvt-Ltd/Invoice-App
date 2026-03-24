const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authModule = require('../middleware/auth');
const auth = authModule && authModule.default ? authModule.default : authModule;

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

module.exports = router; 