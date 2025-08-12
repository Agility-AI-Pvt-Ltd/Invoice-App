import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
    phonenumber: String,
    email: String,
    password: String,
    name: String,
    company: String,
    address: String,
    gstNumber: String,
    panNumber: String,
    website: String,
    isGstRegistered: Boolean,
    businessLogo: String,
    otp: String,
    otpExpiration: Date
}, { timestamps: true });

export default mongoose.model("PendingUser", pendingUserSchema);
