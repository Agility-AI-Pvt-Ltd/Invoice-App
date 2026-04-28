import express from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import auth from "../middleware/auth.js";
import {
    sendOtpForRegistration,
    sendOtpForLogin,
    verifyOtpAndRegister,
    verifyOtpAndLogin,
    getMe,
    test
} from "../controllers/userController.js";

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many OTP requests, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/send-otp-register", otpLimiter, sendOtpForRegistration);
router.post("/send-otp-login", otpLimiter, sendOtpForLogin);
router.post("/verify-otp-register", otpLimiter, verifyOtpAndRegister);
router.post("/verify-otp-login", otpLimiter, verifyOtpAndLogin);
router.get("/me", auth, getMe);
router.get("/test", test);

// Login user
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Please provide both email and password'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET environment variable is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const token = jwt.sign({ userId: user.id }, jwtSecret, {
            expiresIn: '24h'
        });

        // Send user info (excluding password)
        const { password: _, ...userResponse } = user;
        // Keep _id for frontend compatibility if needed
        userResponse._id = user.id;

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
router.get('/profile', auth, async (req, res) => {
    try {
        // auth middleware already sets req.user
        res.json(req.user);
    } catch (err) {
        console.error('Profile error:', err);
        res.status(401).json({ error: 'Please authenticate' });
    }
});

// Update user profile
router.post('/profile/update', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await User.comparePassword(req.body.currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Update allowed fields
        const updateData = {};
        const updateFields = ['name', 'company', 'address', 'phone', 'website', 'panNumber',
            'isGstRegistered', 'gstNumber', 'businessLogo'];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Update password if provided
        if (req.body.newPassword) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.body.newPassword, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData);
        
        const { password: _, ...userResponse } = updatedUser;
        userResponse._id = updatedUser.id;

        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
