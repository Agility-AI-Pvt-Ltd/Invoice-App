import User from "../models/User.js";
import OtpVerification from "../models/OtpVerification.js";
import PendingUser from "../models/PendingUser.js";
import otpGenerator from 'otp-generator';
import { sendOtpEmail } from "../lib/email-service.js";
import jwt from 'jsonwebtoken';

const generateAndSendOtp = async (email) => {
    const otp = otpGenerator.generate(6, { 
        upperCaseAlphabets: false, 
        specialChars: false, 
        lowerCaseAlphabets: false 
    });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save/Update OTP in Firestore
    await OtpVerification.findOneAndUpdate(
        { email }, 
        { otp, expiresAt }, 
        { upsert: true }
    );

    // Send Email
    return await sendOtpEmail(email, otp);
};

export const sendOtpForRegistration = async (req, res) => {
    try {
        const { email, name, password, ...otherData } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered. Please login." });
        }

        // Store pending user data
        await PendingUser.findOneAndUpdate(
            { email },
            { name, password, ...otherData },
            { upsert: true }
        );

        const sent = await generateAndSendOtp(email);
        if (sent) {
            res.json({ success: true, message: "Verification code sent to your email." });
        } else {
            res.status(500).json({ success: false, message: "Failed to send email. Check SMTP config." });
        }
    } catch (error) {
        console.error("Registration OTP error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendOtpForLogin = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found. Please register first." });
        }

        const sent = await generateAndSendOtp(email);
        if (sent) {
            res.json({ success: true, message: "Verification code sent to your email." });
        } else {
            res.status(500).json({ success: false, message: "Failed to send email." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyOtpAndRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpDoc = await OtpVerification.findOne({ email });
        if (!otpDoc || otpDoc.otp !== otp || new Date() > otpDoc.expiresAt.toDate()) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
        }

        const pendingUser = await PendingUser.findOne({ email });
        if (!pendingUser) {
            return res.status(400).json({ success: false, message: "Registration session expired." });
        }

        // Create actual user
        const newUser = await User.create({
            email: pendingUser.email,
            name: pendingUser.name,
            password: pendingUser.password, // UserModel.create handles hashing
            phonenumber: pendingUser.phonenumber || '',
            company: pendingUser.company || '',
        });

        // Cleanup
        await OtpVerification.findOneAndDelete({ email });
        await PendingUser.findOneAndDelete({ email });

        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ success: true, token, user: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyOtpAndLogin = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpDoc = await OtpVerification.findOne({ email });
        if (!otpDoc || otpDoc.otp !== otp || new Date() > otpDoc.expiresAt.toDate()) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Cleanup
        await OtpVerification.findOneAndDelete({ email });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ success: true, token, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMe = async (req, res) => {
    res.json(req.user);
};

export const test = async (req, res) => {
    res.json({ message: "Auth service is working" });
};
