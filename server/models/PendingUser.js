// server/models/PendingUser.js

import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
    phonenumber: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    website: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpiration: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model("PendingUser", pendingUserSchema);
