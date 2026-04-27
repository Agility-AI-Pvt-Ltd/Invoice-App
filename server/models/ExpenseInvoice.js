import { FirestoreModel } from "../lib/firestore-utils.js";

class ExpenseInvoiceModel extends FirestoreModel {
    constructor() {
        super("expense_invoices");
    }
}

const ExpenseInvoice = new ExpenseInvoiceModel();
export default ExpenseInvoice;