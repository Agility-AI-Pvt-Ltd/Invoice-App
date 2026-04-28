import { FirestoreModel } from "../lib/firestore-utils.js";

class OtpVerificationModel extends FirestoreModel {
    constructor() {
        super("otp_verifications");
    }
}

const OtpVerification = new OtpVerificationModel();
export default OtpVerification;
