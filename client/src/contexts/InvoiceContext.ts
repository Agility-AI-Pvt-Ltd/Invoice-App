// client/src/contexts/InvoiceContext.ts
import React from "react";

/* ---- Types ---- */
// client/src/contexts/InvoiceContext.tsx (or .ts)
export type Party = {
  // seller or customer
  businessName?: string; // used by billFrom
  companyName?: string;
  name?: string; // used by billTo/shipTo
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipCode?: string;
  country?: string;
  gst?: string;
  gstNumber?: string;
  gstin?: string;
  pan?: string;
  panNumber?: string;
};

export type InvoiceItem = {
  description: string;
  hsn?: string;
  quantity: number;
  unitPrice: number;
  gst: number;
  discount?: number;
  amount: number;
};

export type InvoiceModel = {
  _id?: string; // optional id fields if coming from backend
  id?: string;
  invoiceNumber: string;
  date: string;      // storing ISO or yyyy-mm-dd
  dueDate?: string;
  billFrom?: Party;  // <--- include this
  billTo?: Party;    // <--- include this
  shipTo?: Party;    // <--- include this
  items: InvoiceItem[];
  notes?: string;
  currency?: string;
  status?: "draft" | "sent" | string;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
  discount?: number;
  shipping?: number;
  termsAndConditions?: string;
  // add anything else your app/back-end expects
};


export type InvoiceContextType = {
  invoice: InvoiceModel;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceModel>>;
  recalcTotals: () => void;
};

/* ---- Context ---- */
export const InvoiceContext = React.createContext<InvoiceContextType | undefined>(
  undefined
);

export default InvoiceContext;
