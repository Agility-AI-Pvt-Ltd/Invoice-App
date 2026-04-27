import { FirestoreModel } from "../lib/firestore-utils.js";

class PurchaseOrderModel extends FirestoreModel {
    constructor() {
        super("purchase_orders");
    }

    async findByUser(userId, sort = { date: -1 }) {
        const field = Object.keys(sort)[0];
        const direction = sort[field] === -1 ? 'desc' : 'asc';
        return this.findWithSort({ user: userId }, field, direction);
    }
}

const PurchaseOrder = new PurchaseOrderModel();
export default PurchaseOrder;
