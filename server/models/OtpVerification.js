import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phonenumber: { type: String, unique: true, required: true },
  otp: { type: String, required: true },
  otpExpiration: { type: Date, required: true },
});

export default mongoose.model("OtpVerification", otpSchema);
