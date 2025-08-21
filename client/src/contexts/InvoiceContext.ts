// client/src/contexts/InvoiceContext.ts
import React from "react";

/* ---- Types ---- */
export type InvoiceItem = {
  description?: string;
  hsn?: string | null;
  quantity?: number;
  unitPrice?: number;
  gst?: number;
  discount?: number;
  amount?: number;
};

export type InvoiceModel = {
  invoiceNumber?: string;
  date?: string;
  dueDate?: string;
  billTo?: {
    name?: string;
    email?: string;
    address?: string;
    state?: string;
    gst?: string;
    pan?: string;
    phone?: string;
  };
  shipTo?: any;
  items: InvoiceItem[];
  notes?: string;
  currency?: string;
  status?: "draft" | "sent" | "paid" | string;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
  termsAndConditions?: string;
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
