const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request body:', req.body);
        
        const { 
            email, 
            password, 
            name, 
            company, 
            address, 
            phone,
            website,
            panNumber,
            isGstRegistered,
            gstNumber,
            businessLogo 
        } = req.body;

        // Validate required fields
        if (!email || !password || !name || !company || !address || !phone) {
            console.log('Missing required fields:', {
                email: !email,
                password: !password,
                name: !name,
                company: !company,
                address: !address,
                phone: !phone
            });
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: {
                    email: !email,
                    password: !password,
                    name: !name,
                    company: !company,
                    address: !address,
                    phone: !phone
                }
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            email,
            password,
            name,
            company,
            address,
            phone,
            website,
            panNumber,
            isGstRegistered,
            gstNumber,
            businessLogo
        });

        await user.save();
        console.log('User created successfully:', user._id);

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '24h'
        });

        // Send user info (excluding password)
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            company: user.company,
            address: user.address,
            phone: user.phone,
            website: user.website,
            panNumber: user.panNumber,
            isGstRegistered: user.isGstRegistered,
            gstNumber: user.gstNumber,
            businessLogo: user.businessLogo
        };

        res.status(201).json({
            token,
            user: userResponse
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            error: 'Server error',
            details: err.message 
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Please provide both email and password' 
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ 
                error: 'Invalid credentials'
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            return res.status(400).json({ 
                error: 'Invalid credentials'
            });        }// Create JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '24h'
        });

        // Send user info (excluding password)
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            company: user.company,
            address: user.address,
            phone: user.phone,
            website: user.website,
            panNumber: user.panNumber,
            isGstRegistered: user.isGstRegistered,
            gstNumber: user.gstNumber,
            businessLogo: user.businessLogo
        };

        res.json({
            token,
            user: userResponse
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Profile error:', err);
        res.status(401).json({ error: 'Please authenticate' });
    }
});

// Update user profile
router.post('/profile/update', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Update allowed fields
        const updateFields = ['name', 'company', 'address', 'phone', 'website', 'panNumber', 
            'isGstRegistered', 'gstNumber', 'businessLogo'];
        
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        // Update password if provided
        if (req.body.newPassword) {
            user.password = req.body.newPassword;
        }

        await user.save();
        
        // Send updated user info (excluding password)
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            company: user.company,
            address: user.address,
            phone: user.phone,
            website: user.website,
            panNumber: user.panNumber,
            isGstRegistered: user.isGstRegistered,
            gstNumber: user.gstNumber,
            businessLogo: user.businessLogo
        };

        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
