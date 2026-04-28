import { FirestoreModel } from "../lib/firestore-utils.js";

class PendingUserModel extends FirestoreModel {
    constructor() {
        super("pending_users");
    }
}

const PendingUser = new PendingUserModel();
export default PendingUser;
