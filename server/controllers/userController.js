// controllers/userController.js
import dotenv from "dotenv";
dotenv.config();

import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";
import axios from "axios";
import PendingUser from "../models/PendingUser.js";
import User from "../models/User.js";
import OtpVerification from "../models/OtpVerification.js";

const normalizePhone = (ph) => {
    if (!ph) return ph;
    let p = ph.toString().trim();
    if (p.startsWith("+")) p = p.slice(1);
    // if local 10-digit number, prefix country code 91
    if (p.length === 10) p = "91" + p;
    return p;
};


const sendOtpHelper = async (phonenumber, otp, res) => {
    try {
        const phone = normalizePhone(phonenumber);

        const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP in OtpVerification
        await OtpVerification.findOneAndUpdate(
            { phonenumber: phone },
            { otp, otpExpiration },
            { upsert: true, new: true }
        );

        const message = `Your EduManiax OTP for verification is: ${otp}. OTP is confidential, refrain from sharing it with anyone. By Edumarc Technologies`;

        const response = await axios.post(
            "https://smsapi.edumarcsms.com/api/v1/sendsms",
            {
                number: [phone],
                message,
                senderId: "EDUMRC",
                templateId: "1707168926925165526",
            },
            {
                headers: {
                    apikey: process.env.EDUMARC_API_KEY,
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            }
        );

        const { data } = response;
        if (data && data.success) {
            return res.status(200).json({ message: "OTP sent successfully" });
        } else {
            console.error("SMS API returned:", response.data);
            return res.status(500).json({ message: "Failed to send OTP", details: response.data });
        }
    } catch (err) {
        console.error("Error sending OTP:", err?.response?.data || err.message || err);
        return res.status(500).json({ message: "Internal server error", error: err?.message || err });
    }
};

const sendOtpForRegistration = async (req, res) => {
    try {
        const {
            name,            
            phonenumber,             
            email,       
            password,
            website
        } = req.body;

        // Required fields check
        if (!name || !phonenumber || !email || !password || !website) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Generate OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);

        // Save in PendingUser
        await PendingUser.findOneAndUpdate(
            { phonenumber: phonenumber },
            {
                phonenumber: phonenumber,
                email: email,
                password,
                name: name,
                website,
                otp,
                otpExpiration
            },
            { upsert: true, new: true }
        );

        console.log(`📩 OTP for ${phonenumber}: ${otp}`);

        // Send OTP via helper
        return sendOtpHelper(phonenumber, otp, res);

    } catch (err) {
        console.error("sendOtpForRegistration error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};




const sendOtpForLogin = async (req, res) => {
    const { phonenumber } = req.body;
    if (!phonenumber) return res.status(400).json({ message: "Phone number is required" });

    const phone = normalizePhone(phonenumber);
    const existingUser = await User.findOne({ phonenumber: phone });
    if (!existingUser) return res.status(404).json({ message: "User not found. Please register." });

    return sendOtpHelper(phonenumber, res);
};


const verifyOtpAndRegister = async (req, res) => {
    try {
        const { phonenumber, otp } = req.body;
        console.log("📥 Request Body:", req.body);

        if (!phonenumber || !otp) {
            return res.status(400).json({ message: "Phone number and OTP are required" });
        }

        const pending = await PendingUser.findOne({ phonenumber });
        console.log("🔍 Pending User:", pending);

        if (!pending || pending.otp !== otp || new Date() > pending.otpExpiration) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const user = await User.create({
            phonenumber: phonenumber,
            email: pending.email,
            password: pending.password,
            name: pending.name,
            website: pending.website
        });

        await PendingUser.deleteOne({ _id: pending._id });

        if (!process.env.Jwt_sec) {
            throw new Error("JWT secret is missing");
        }

        const token = jwt.sign({ id: user._id }, process.env.Jwt_sec, { expiresIn: "5d" });

        return res.status(201).json({ message: "User registered successfully", token, user });

    } catch (error) {
        console.error("verifyOtpAndRegister error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



const verifyOtpAndLogin = async (req, res) => {
    try {
        const { phonenumber, otp } = req.body;
        if (!phonenumber || !otp) return res.status(400).json({ message: "Phone number and OTP are required" });

        const phone = normalizePhone(phonenumber);

        const otpRecord = await OtpVerification.findOne({ phonenumber: phonenumber });
        if (!otpRecord || otpRecord.otp !== otp || new Date() > otpRecord.otpExpiration) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const user = await User.findOne({ phonenumber: phonenumber });
        if (!user) return res.status(404).json({ message: "User not found. Please register." });

        await OtpVerification.deleteOne({ phonenumber: phonenumber });

        const token = jwt.sign({ id: user._id }, process.env.Jwt_sec, { expiresIn: "5d" });

        res.status(200).json({ success: true, message: "Logged in", token, user });
    } catch (error) {
        console.error("verifyOtpAndLogin error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// getMe and updateProfile assume authentication middleware sets req.user


const getMe = async (req, res) => {
    try {
        const id = req?.user?.id || req?.user?._id || req?.user;
        if (!id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User.findById(id).select("-__v -password");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ user });
    } catch (error) {
        console.error("getMe error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const test = async (req, res) => {
    res.status(200).json({ success: true, message: "Welcome to EduManiax!" });
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const allowedFields = ["name", "age", "userClass", "phonenumber", "email"];
        const updateData = {};

        for (const [key, value] of Object.entries(req.body)) {
            if (allowedFields.includes(key)) updateData[key] = value;
        }

        if (updateData.age) {
            const age = parseInt(updateData.age);
            if (age < 1 || age > 100) return res.status(400).json({ message: "Age must be between 1 and 100" });
            updateData.age = age;
        }

        if (updateData.phonenumber) {
            const existingUser = await User.findOne({ phonenumber: updateData.phonenumber, _id: { $ne: userId } });
            if (existingUser) return res.status(400).json({ message: "Phone number already in use" });
        }

        if (updateData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updateData.email)) return res.status(400).json({ message: "Invalid email format" });

            const existingEmailUser = await User.findOne({ email: updateData.email, _id: { $ne: userId } });
            if (existingEmailUser) return res.status(400).json({ message: "Email already in use" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-__v");
        res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("updateProfile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export {
    sendOtpForRegistration,
    sendOtpForLogin,
    verifyOtpAndRegister,
    verifyOtpAndLogin,
    getMe,
    test,
    updateProfile,
};
