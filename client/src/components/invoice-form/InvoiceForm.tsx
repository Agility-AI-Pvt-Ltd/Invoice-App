import React, { createContext, useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1Form from "./Step1Form";
import Step2Form from "./Step2Form";
import Step3Form from "./Step3Form";
import Step4Form from "./Step4Form";
import { BanknoteX, CurlyBraces, LocationEdit, Pin } from "lucide-react";
import axios from "axios";

type Props = {
  onCancel: () => void;
};

const steps = [
  { label: "Invoice Details", icon: Pin },
  { label: "Party Details", icon: LocationEdit },
  { label: "Item Details", icon: BanknoteX },
  { label: "Sub Total", icon: CurlyBraces },
];

export type InvoiceItem = {
  description?: string;
  hsn?: string;
  quantity?: number;
  unitPrice?: number;
  gst?: number;
  discount?: number;
  amount?: number;
};

export type InvoiceModel = {
  invoiceNumber?: string;
  date?: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
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

type InvoiceContextType = {
  invoice: InvoiceModel;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceModel>>;
  recalcTotals: () => void;
};
/* eslint-disable react-refresh/only-export-components */
export const InvoiceContext = createContext<InvoiceContextType | undefined>(
  undefined
);

const API_BASE = "https://invoice-backend-604217703209.asia-south1.run.app";

export default function InvoiceForm({ onCancel }: Props) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const initialInvoice: InvoiceModel = {
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    billTo: { name: "", email: "", address: "", state: "", gst: "", pan: "", phone: "" },
    shipTo: {},
    items: [
      {
        description: "",
        hsn: "",
        quantity: 1,
        unitPrice: 0,
        gst: 0,
        discount: 0,
        amount: 0,
      },
    ],
    notes: "",
    currency: "INR",
    status: "draft",
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    total: 0,
    termsAndConditions: "",
  };

  const [invoice, setInvoice] = useState<InvoiceModel>(initialInvoice);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Recalculate subtotal/taxes/total (keeps UI in sync)
  const recalcTotals = () => {
    setInvoice((prev) => {
      const items = prev.items || [];
      let subtotal = 0;
      let totalGst = 0;
      items.forEach((it) => {
        const q = Number(it.quantity || 0);
        const up = Number(it.unitPrice || 0);
        const gst = Number(it.gst || 0);
        const disc = Number(it.discount || 0);
        const base = q * up;
        const gstAmt = (base * gst) / 100;
        subtotal += base - disc;
        totalGst += gstAmt;
      });
      const cgst = +(totalGst / 2).toFixed(2);
      const sgst = +(totalGst / 2).toFixed(2);
      const igst = 0;
      const total = +(subtotal + totalGst).toFixed(2);

      return {
        ...prev,
        subtotal: +subtotal.toFixed(2),
        cgst,
        sgst,
        igst,
        total,
      };
    });
  };

  // Synchronous totals computation used for sending payload so we don't rely on async setState
  const computeTotalsSync = (inv: InvoiceModel) => {
    const items = inv.items || [];
    let subtotal = 0;
    let totalGst = 0;
    items.forEach((it) => {
      const q = Number(it.quantity || 0);
      const up = Number(it.unitPrice || 0);
      const gst = Number(it.gst || 0);
      const disc = Number(it.discount || 0);
      const base = q * up;
      const gstAmt = (base * gst) / 100;
      subtotal += base - disc;
      totalGst += gstAmt;
    });
    const cgst = +(totalGst / 2).toFixed(2);
    const sgst = +(totalGst / 2).toFixed(2);
    const igst = 0;
    const total = +(subtotal + totalGst).toFixed(2);

    return {
      subtotal: +subtotal.toFixed(2),
      cgst,
      sgst,
      igst,
      total,
    };
  };

  // helpers to convert item values to numbers before sending
  const sanitizePayload = (payload: InvoiceModel) => {
    return {
      ...payload,
      items: (payload.items || []).map((it) => ({
        description: it.description,
        hsn: it.hsn || null,
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        gst: Number(it.gst) || 0,
        discount: Number(it.discount) || 0,
        amount: Number(it.amount) || 0,
      })),
      subtotal: Number(payload.subtotal) || 0,
      cgst: Number(payload.cgst) || 0,
      sgst: Number(payload.sgst) || 0,
      igst: Number(payload.igst) || 0,
      total: Number(payload.total) || 0,
    } as InvoiceModel;
  };

  // Save (common) -> status can be "draft" or "sent"
  const handleSave = async (status: "draft" | "sent") => {
    if (saving) return; // prevent double submits
    setSaving(true);
    try {
      // Keep UI totals updated but compute payload totals synchronously so we send exact numbers
      recalcTotals();
      const totals = computeTotalsSync(invoice);

      const prepared = {
        ...invoice,
        ...totals,
        status,
        // backend expects ISO datetimes for datetime fields; convert if date present
        date: invoice.date ? new Date(invoice.date).toISOString() : new Date().toISOString(),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : undefined,
      } as InvoiceModel;

      const payload = sanitizePayload(prepared);

      // ---- Console debugging: show exactly what we will send ----
      console.groupCollapsed("Invoice payload -> sending to backend");
      try {
        console.log("payload (object):", payload);
        console.log("payload (json):", JSON.stringify(payload, null, 2));
      } catch (e) {
        console.log("payload (inspection error)", e);
      }

      // try multiple common storage keys for token
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("access_token") ||
        null;

      console.log("localStorage token (raw):", token);

      // detect if cookie-based auth may exist (httpOnly cookies can't be read, but presence of certain cookie names can hint)
      const cookieHint = typeof document !== "undefined" && document.cookie ? document.cookie : "";
      const hasCookieAuthHint = /token|session|jwt|auth/i.test(cookieHint);
      console.log("document.cookie hint:", hasCookieAuthHint ? cookieHint : "(no obvious auth cookie)");

      const axiosConfig: any = { timeout: 20000 };
      if (token) {
        axiosConfig.headers = { Authorization: `Bearer ${token}` };
        axiosConfig.withCredentials = false;
        console.log("Using Authorization: Bearer <token> header for request.");
      } else if (hasCookieAuthHint) {
        // fallback to cookies if there is a likely auth cookie present
        axiosConfig.withCredentials = true;
        console.log("No token in localStorage — falling back to cookie-based request (withCredentials: true). Ensure backend accepts cookie auth.");
      } else {
        console.error("Auth token not found and no auth cookie detected. Please login.");
        alert("You are not logged in or your session expired. Please login and try again.");
        setSaving(false);
        console.groupEnd();
        return;
      }

      console.groupEnd();

      const res = await axios.post(`${API_BASE}/api/invoices`, payload, axiosConfig);

      const createdInvoice = res.data;
      // notify other parts of app to refresh lists (no UI changes here)
      window.dispatchEvent(new CustomEvent("invoice:created", { detail: createdInvoice }));

      alert("Invoice saved successfully.");
      // close modal / panel if parent expects that behavior
      onCancel();
      return createdInvoice;
    } catch (err: any) {
      console.error("Save invoice error:", err);
      const msg =
        err?.response?.data?.detail || err?.response?.data || err.message || "Save failed";
      alert("Failed to save invoice: " + msg);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndSend = async () => {
    await handleSave("sent");
  };

  const handleSaveDraft = async () => {
    await handleSave("draft");
  };

  return (
    <InvoiceContext.Provider value={{ invoice, setInvoice, recalcTotals }}>
      <div className="w-full px-2 sm:px-6 lg:px-8 py-6">
        <StepIndicator currentStep={step} steps={steps} />

        <div className="mt-6">
          {step === 1 && <Step1Form />}
          {step === 2 && <Step2Form />}
          {step === 3 && <Step3Form />}
          {step === 4 && <Step4Form />}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 gap-4">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm w-full sm:w-auto"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto">
            {step > 1 && step < 4 && (
              <button
                onClick={prevStep}
                className="w-full sm:w-auto px-6 py-2 border-2 border-purple-700 text-purple-700 font-semibold rounded-md hover:bg-purple-50 transition duration-200"
              >
                Back
              </button>
            )}

            {step < 4 && (
              <button
                onClick={() => {
                  nextStep();
                  recalcTotals();
                }}
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-b from-purple-500 to-purple-700 text-white font-semibold rounded-md hover:opacity-90 transition duration-200"
              >
                Next
              </button>
            )}

            {step === 4 && (
              <>
                <button
                  onClick={() => handleSaveDraft()}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2 border-3 border-[#785FDA] text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition duration-200"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => {
                    // Print preview is UI-only; keep existing behavior
                    console.log("Print preview");
                    // no API call here
                  }}
                  className="w-full sm:w-auto px-6 py-2 border-3 border-[#785FDA] text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition duration-200"
                >
                  Print Preview
                </button>
                <button
                  onClick={() => handleSaveAndSend()}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white font-semibold rounded-md hover:opacity-90 transition duration-200"
                >
                  Save and Send
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </InvoiceContext.Provider>
  );
}
