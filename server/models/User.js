import bcrypt from "bcryptjs";
import { FirestoreModel } from "../lib/firestore-utils.js";

class UserModel extends FirestoreModel {
    constructor() {
        super("users");
    }

    async create(userData) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        return super.create({
            ...userData,
            password: hashedPassword,
            isGstRegistered: userData.isGstRegistered || false,
            createdAt: new Date()
        });
    }

    async comparePassword(candidatePassword, hashedPassword) {
        return bcrypt.compare(candidatePassword, hashedPassword);
    }

    // Custom findByEmail helper
    async findByEmail(email) {
        return this.findOne({ email: email.toLowerCase() });
    }
}

const User = new UserModel();
export default User;
