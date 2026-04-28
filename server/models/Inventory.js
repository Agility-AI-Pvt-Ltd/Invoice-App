import { FirestoreModel } from "../lib/firestore-utils.js";

class InventoryModel extends FirestoreModel {
    constructor() {
        super("inventory");
    }
}

const Inventory = new InventoryModel();
export default Inventory;