// client/src/components/invoice-form/InvoiceForm.tsx

import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1Form from "./Step1Form";
import Step2Form from "./Step2Form";
import Step3Form from "./Step3Form";
import Step4Form from "./Step4Form";
import { BanknoteX, CurlyBraces, LocationEdit, Pin } from "lucide-react";
import api from "@/lib/api";
import { useFormPersistence } from "@/hooks/useFormPersistence";

import { InvoiceContext } from "@/contexts/InvoiceContext";
import type { InvoiceModel } from "@/contexts/InvoiceContext";

import PrintPreview from "./Print-preview"; // added import
import { checkInventoryAvailability, updateInventoryStockBulk } from "@/services/api/inventory";
import { mapToBackendStatus } from "@/lib/status-mapping";

type Props = {
  onCancel: () => void;
  initialData?: InvoiceModel; // optional edit data
};

const steps = [
  { label: "Invoice Details", icon: Pin },
  { label: "Party Details", icon: LocationEdit },
  { label: "Item Details", icon: BanknoteX },
  { label: "Sub Total", icon: CurlyBraces },
];




/* ------------------ Helpers ------------------ */

const isValidEmail = (email?: string) => {
  if (!email) return false;
  // simple email regex for validation (good UX, not perfect RFC)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

type ValidationError = { step: number; message: string; field?: string };

/* ------------------ Component ------------------ */

export default function InvoiceForm({ onCancel, initialData }: Props) {
  const defaultInvoice: InvoiceModel = {
    invoiceNumber: "", // Let Step1Form handle auto-generation
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    billFrom: {
      businessName: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      email: "",
      phone: "",
      gst: "",
    },
    billTo: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      gst: "",
      gstNumber: "",
      pan: "",
      panNumber: "",
    },
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

  /* define computeTotals BEFORE mergeWithDefaults to avoid temporal-dead-zone errors */
  const computeTotals = (inv: InvoiceModel) => {
    const items = inv.items || [];
    let subtotal = 0;
    let totalGst = 0;
    items.forEach((it: any) => {
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

  /* ---------- deep merge / normalize helper ----------
     Ensures any incoming initialData is merged with defaults,
     converts dates to YYYY-MM-DD, ensures nested objects/arrays exist,
     and returns a complete InvoiceModel-shaped object.
  */
  const mergeWithDefaults = (data?: Partial<InvoiceModel>) => {
    console.log('🔧 mergeWithDefaults called with data:', data);
    const safe = data ? { ...data } : {};
    const out: any = { ...defaultInvoice };

    // top-level shallow keys (use data if present)
    Object.keys(defaultInvoice).forEach((k) => {
      if ((safe as any)[k] !== undefined && (safe as any)[k] !== null) {
        out[k] = (safe as any)[k];
      }
    });

    // normalize dates -> YYYY-MM-DD for form inputs
    if ((safe as any).date) {
      try {
        out.date = new Date((safe as any).date).toISOString().slice(0, 10);
      } catch {
        out.date = defaultInvoice.date;
      }
    }

    if ((safe as any).dueDate) {
      try {
        out.dueDate = new Date((safe as any).dueDate).toISOString().slice(0, 10);
      } catch {
        out.dueDate = "";
      }
    }

    // billFrom (seller) deep merge
    out.billFrom = {
      ...defaultInvoice.billFrom,
      ...(safe as any).billFrom,
      // sometimes seller info might be flattened in row (companyName/companyAddress)
    };
    // also accept flattened seller fields from passed data
    if ((safe as any).sellerBusinessName) out.billFrom.businessName = (safe as any).sellerBusinessName;
    if ((safe as any).sellerAddress) out.billFrom.address = (safe as any).sellerAddress;
    if ((safe as any).sellerState) out.billFrom.state = (safe as any).sellerState;
    if ((safe as any).sellerEmail) out.billFrom.email = (safe as any).sellerEmail;
    if ((safe as any).sellerPhone) out.billFrom.phone = (safe as any).sellerPhone;
    if ((safe as any).sellerGst) out.billFrom.gst = (safe as any).sellerGst;

    // billTo (customer) deep merge
    // ⚠️ Backend returns nested billTo object with: companyName, email, phone, address, city, state, country, gstNumber, panNumber
    out.billTo = {
      ...defaultInvoice.billTo,
      ...(safe as any).billTo,
    };
    
    // Accept flattened client fields from backend (clientName, clientEmail, etc.)
    if ((safe as any).clientName) out.billTo.name = (safe as any).clientName;
    if ((safe as any).clientEmail) out.billTo.email = (safe as any).clientEmail;
    if ((safe as any).clientPhone) out.billTo.phone = (safe as any).clientPhone;
    if ((safe as any).clientAddress) out.billTo.address = (safe as any).clientAddress;
    if ((safe as any).clientCity) out.billTo.city = (safe as any).clientCity; // ⚠️ New field
    if ((safe as any).clientState) out.billTo.state = (safe as any).clientState; // ⚠️ New field
    if ((safe as any).clientCountry) out.billTo.country = (safe as any).clientCountry; // ⚠️ New field
    if ((safe as any).clientGst) out.billTo.gst = (safe as any).clientGst;
    if ((safe as any).clientPan) out.billTo.pan = (safe as any).clientPan;
    
    // Also handle nested billTo from backend
    if ((safe as any).billTo) {
      if ((safe as any).billTo.companyName) out.billTo.companyName = (safe as any).billTo.companyName;
      if ((safe as any).billTo.name) out.billTo.name = (safe as any).billTo.name;
      if ((safe as any).billTo.email) out.billTo.email = (safe as any).billTo.email;
      if ((safe as any).billTo.phone) out.billTo.phone = (safe as any).billTo.phone;
      if ((safe as any).billTo.address) out.billTo.address = (safe as any).billTo.address;
      if ((safe as any).billTo.city) out.billTo.city = (safe as any).billTo.city; // ⚠️ New field
      if ((safe as any).billTo.state) out.billTo.state = (safe as any).billTo.state; // ⚠️ New field
      if ((safe as any).billTo.country) out.billTo.country = (safe as any).billTo.country; // ⚠️ New field
      if ((safe as any).billTo.gstNumber) out.billTo.gst = (safe as any).billTo.gstNumber;
      if ((safe as any).billTo.panNumber) out.billTo.pan = (safe as any).billTo.panNumber;
    }
    
    // Legacy support
    if ((safe as any).customerName) out.billTo.name = (safe as any).customerName;
    if ((safe as any).customerEmail) out.billTo.email = (safe as any).customerEmail;
    if ((safe as any).customerPhone) out.billTo.phone = (safe as any).customerPhone;
    if ((safe as any).customerAddress) out.billTo.address = (safe as any).customerAddress;
    if ((safe as any).customerGst) out.billTo.gst = (safe as any).customerGst;
    if ((safe as any).customerPan) out.billTo.pan = (safe as any).customerPan;
    if ((safe as any).companyName && !out.billTo.name) out.billTo.companyName = (safe as any).companyName;

    // shipTo
    out.shipTo = {
      ...(defaultInvoice.shipTo as any),
      ...((safe as any).shipTo || {}),
    };

    // items: if provided, normalize each item to required shape; otherwise fallback to default item
    // ⚠️ Backend returns items array with: id, description, hsn, sac, quantity, unitPrice, gstRate, discount, taxableAmount, igst, cgst, sgst, total
    if (Array.isArray((safe as any).items) && (safe as any).items.length > 0) {
      out.items = (safe as any).items.map((it: any) => {
        return {
          id: it?.id,
          inventoryItemId: it?.inventoryItemId ?? null, // ⚠️ NEW: Preserve inventory link from backend
          description: it?.description ?? it?.product ?? "",
          hsn: it?.hsn ?? "",
          sac: it?.sac ?? "",
          quantity: it?.quantity !== undefined ? Number(it.quantity) : 1,
          unitPrice: it?.unitPrice !== undefined ? Number(it.unitPrice) : Number(it?.price ?? 0),
          gst: it?.gstRate !== undefined ? Number(it.gstRate) : Number(it?.gst ?? it?.tax ?? 0), // ⚠️ Backend uses gstRate
          discount: it?.discount !== undefined ? Number(it.discount) : 0,
          taxableAmount: it?.taxableAmount !== undefined ? Number(it.taxableAmount) : 0, // ⚠️ New field
          igst: it?.igst !== undefined ? Number(it.igst) : 0, // ⚠️ New field
          cgst: it?.cgst !== undefined ? Number(it.cgst) : 0, // ⚠️ New field
          sgst: it?.sgst !== undefined ? Number(it.sgst) : 0, // ⚠️ New field
          amount: it?.total !== undefined ? Number(it.total) : (it?.amount !== undefined
              ? Number(it.amount)
              : +(((it?.quantity || 1) * (it?.unitPrice ?? it?.price ?? 0) - (it?.discount || 0))).toFixed(2)),
        };
      });
    } else {
      // maybe the row contains single-item flattened fields
      const possibleItem = {
        description: (safe as any).product || (safe as any).description || "",
        hsn: (safe as any).hsn || "",
        quantity: (safe as any).quantity || 1,
        unitPrice: (safe as any).unitPrice || (safe as any).price || 0,
        gst: (safe as any).gst || 0,
        discount: (safe as any).discount || 0,
        amount: (safe as any).totalAmount || (safe as any).amount || 0,
      };
      // only use flattened item if any meaningful field present
      const hasAny = Boolean(
        possibleItem.description ||
        possibleItem.hsn ||
        possibleItem.unitPrice ||
        possibleItem.amount ||
        possibleItem.quantity > 1
      );
      out.items = hasAny ? [possibleItem] : defaultInvoice.items;
    }

    // totals and numeric fields
    out.subtotal = (safe as any).subtotal ?? (safe as any).subtotalAmount ?? defaultInvoice.subtotal;
    out.total = (safe as any).total ?? (safe as any).totalAmount ?? defaultInvoice.total;
    out.cgst = (safe as any).cgst ?? defaultInvoice.cgst;
    out.sgst = (safe as any).sgst ?? defaultInvoice.sgst;
    out.igst = (safe as any).igst ?? defaultInvoice.igst;
    out.currency = (safe as any).currency ?? defaultInvoice.currency;
    out.status = (safe as any).status ?? (safe as any).paymentStatus ?? defaultInvoice.status;
    out.notes = (safe as any).notes ?? defaultInvoice.notes;
    out.termsAndConditions = (safe as any).termsAndConditions ?? defaultInvoice.termsAndConditions;

    // keep any id fields
    if ((safe as any)._id) out._id = (safe as any)._id;
    if ((safe as any).id) out.id = (safe as any).id;

    // ensure numbers are numbers on items
    out.items = (out.items || []).map((it: any) => ({
      ...it,
      quantity: Number(it.quantity || 0),
      unitPrice: Number(it.unitPrice || 0),
      gst: Number(it.gst || 0),
      discount: Number(it.discount || 0),
      amount: Number(it.amount || 0),
    }));

    // compute final totals from items to keep consistent view (but allow prefilled totals if present)
    const computedTotals = computeTotals(out);
    // if incoming provided total/subtotal are falsy (0 or undefined), use computed; otherwise respect provided non-zero values
    if (!out.subtotal || Number(out.subtotal) === 0) out.subtotal = computedTotals.subtotal;
    if (!out.total || Number(out.total) === 0) out.total = computedTotals.total;
    out.cgst = Number(out.cgst) || computedTotals.cgst;
    out.sgst = Number(out.sgst) || computedTotals.sgst;
    out.igst = Number(out.igst) || computedTotals.igst;

    console.log('✅ mergeWithDefaults result - billTo fields:');
    console.log('  - billTo.name:', out.billTo?.name);
    console.log('  - billTo.companyName:', out.billTo?.companyName);
    console.log('  - billTo.email:', out.billTo?.email);
    console.log('  - billTo.phone:', out.billTo?.phone);
    console.log('  - billTo.address:', out.billTo?.address);
    console.log('  - billTo.city:', out.billTo?.city);
    console.log('  - billTo.state:', out.billTo?.state);
    console.log('  - billTo.country:', out.billTo?.country);
    console.log('  - billTo.gst:', out.billTo?.gst);
    console.log('  - billTo.pan:', out.billTo?.pan);

    return out as InvoiceModel;
  };

  // Generate unique form ID for draft persistence
  const formId = `invoice-form-${initialData?.id || initialData?._id ? `edit-${initialData.id || initialData._id}` : 'new'}`;

  // 🔹 Use form persistence hook for draft functionality
  const {
    formData: invoice,
    setFormData: setInvoice,
    hasSavedState,
    clearSavedState,
  } = useFormPersistence({
    formId,
    initialData: mergeWithDefaults(initialData),
    autoSave: true,
    autoSaveDelay: 1000,
    onRestore: (restoredData) => {
      console.log('📂 Invoice form draft restored:', restoredData);
    }
  });

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // new: state for print preview modal (holds sanitized invoice for preview)
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceModel | null>(null);

  // Field-level inline errors mapping: fieldPath -> message
  type FieldErrors = Record<string, string>;
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Handle cancel with draft cleanup
  const handleCancel = () => {
    clearSavedState(); // Clear the draft when user cancels
    onCancel();
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const recalcTotals = () => {
    setInvoice((prev) => {
      const totals = computeTotals(prev);
      return {
        ...prev,
        ...totals,
      };
    });
  };

  /**
   * sanitizePayload
   * - converts numeric fields to numbers
   * - converts date strings to ISO strings
   * - removes internal props like _id/id/user from payload root (backend will ignore user)
   * - ensures required nested fields exist (billTo.state, shipTo, notes)
   */
  const sanitizePayload = (payload: any) => {
    const cleaned: any = { ...payload };

    // remove internal keys that should not be sent as part of the model
    delete cleaned._id;
    delete cleaned.id;
    delete cleaned.user;
    delete cleaned.__v; // if Mongo added it

    // Ensure billFrom exists (seller/business details)
    cleaned.billFrom = {
      businessName: payload.billFrom?.businessName ?? "",
      address: payload.billFrom?.address ?? "",
      city: payload.billFrom?.city ?? "",
      state:
        payload.billFrom?.state !== undefined && payload.billFrom?.state !== null
          ? String(payload.billFrom.state)
          : "NA",
      country: payload.billFrom?.country ?? "India",
      email: payload.billFrom?.email ?? "",
      phone: payload.billFrom?.phone ?? "",
      gst: payload.billFrom?.gst ?? "",
    };

    // Ensure billTo exists and contains required keys (provide safe defaults)
    // ⚠️ Backend requires: name (person), companyName (company), city, state, country, zipCode
    cleaned.billTo = {
      name: payload.billTo?.name ?? "",
      companyName: payload.billTo?.companyName ?? "",
      email: payload.billTo?.email ?? "",
      phone: payload.billTo?.phone ?? "",
      address: payload.billTo?.address ?? "",
      city: payload.billTo?.city ?? "", // ⚠️ REQUIRED - send to backend
      state:
        payload.billTo?.state !== undefined && payload.billTo?.state !== null
          ? String(payload.billTo.state)
          : "NA",
      zipCode: payload.billTo?.zipCode ?? payload.billTo?.zip ?? "", // ⚠️ Backend uses zipCode
      country: payload.billTo?.country ?? "India", // ⚠️ REQUIRED - send to backend
      gstNumber: payload.billTo?.gstNumber ?? payload.billTo?.gst ?? "",
      panNumber: payload.billTo?.panNumber ?? payload.billTo?.pan ?? "",
      // Legacy support for old field names
      gst: payload.billTo?.gst ?? payload.billTo?.gstNumber ?? "",
      pan: payload.billTo?.pan ?? payload.billTo?.panNumber ?? "",
    };

    // Ensure shipTo always exists with safe defaults (backend requires presence)
    cleaned.shipTo = {
      name: payload.shipTo?.name ?? "",
      email: payload.shipTo?.email ?? "",
      address: payload.shipTo?.address ?? "",
      state:
        payload.shipTo?.state !== undefined && payload.shipTo?.state !== null
          ? String(payload.shipTo.state)
          : "NA",
      gst: payload.shipTo?.gst ?? "",
      pan: payload.shipTo?.pan ?? "",
      phone: payload.shipTo?.phone ?? "",
    };

    // Ensure items array is present and typed, avoid nulls
    cleaned.items = (payload.items || []).map((it: any) => {
      const quantity = Number(it.quantity) || 0;
      const unitPrice = Number(it.unitPrice) || 0;
      const discount = Number(it.discount) || 0;
      const gst = Number(it.gst) || 0;
      const computedAmount = +(quantity * unitPrice - discount).toFixed(2);
      return {
        inventoryItemId: it.inventoryItemId ?? null, // ⚠️ CRITICAL: Link to inventory for stock reduction
        description: it.description ?? "",
        hsn: it.hsn ?? "", // always string (not null)
        quantity,
        unitPrice,
        gst,
        discount,
        amount: Number(it.amount) || computedAmount,
      };
    });

    // numbers
    cleaned.subtotal = Number(payload.subtotal) || 0;
    cleaned.cgst = Number(payload.cgst) || 0;
    cleaned.sgst = Number(payload.sgst) || 0;
    cleaned.igst = Number(payload.igst) || 0;
    cleaned.total = Number(payload.total) || 0;
    cleaned.discount = Number(payload.discount) || 0;
    cleaned.shipping = Number(payload.shipping) || 0;

    // ensure notes always string (backend required)
    cleaned.notes = payload.notes ?? "";

    // dates: convert short date or ISO-like to full ISO string (backend expects datetimes)
    if (payload.date) {
      try {
        cleaned.date = new Date(payload.date).toISOString();
      } catch {
        cleaned.date = new Date().toISOString();
      }
    } else {
      cleaned.date = new Date().toISOString();
    }

    if (payload.dueDate) {
      try {
        cleaned.dueDate = new Date(payload.dueDate).toISOString();
      } catch {
        cleaned.dueDate = undefined;
      }
    } else {
      cleaned.dueDate = undefined;
    }

    // remove undefined entries (backend may dislike explicit undefined)
    Object.keys(cleaned).forEach((k) => {
      if (cleaned[k] === undefined) delete cleaned[k];
    });

    return cleaned as InvoiceModel;
  };

  /* --------------- New: Client-side validation ----------------
     validateInvoice returns array of ValidationError describing
     problems organized by step so user knows exactly what to fix.
  */
  // (validation helpers kept unchanged)...

  // const formatValidationErrors = (errs: ValidationError[]) => {
  //   if (!errs || errs.length === 0) return "";
  //   errs.sort((a, b) => a.step - b.step);
  //   const grouped: Record<number, string[]> = {};
  //   errs.forEach((e) => {
  //     grouped[e.step] = grouped[e.step] || [];
  //     grouped[e.step].push(e.message);
  //   });
  //   const stepLabels = ["", "Invoice Details", "Party Details", "Item Details", "Sub Total"];
  //   const lines: string[] = [];
  //   Object.keys(grouped).forEach((s) => {
  //     const stepNum = Number(s);
  //     lines.push(`${stepLabels[stepNum] || "Step " + stepNum}:`);
  //     grouped[stepNum].forEach((m) => lines.push(` • ${m}`));
  //   });
  //   return lines.join("\n");
  // };

  const setErrorsFromArray = (errs: ValidationError[]) => {
    const fe: FieldErrors = {};
    errs.forEach((e) => {
      if (e.field) fe[e.field] = e.message;
      else fe[`_step_${e.step}`] = e.message;
    });
    setFieldErrors(fe);
  };

  const clearFieldError = (fieldPath?: string) => {
    if (!fieldPath) {
      setFieldErrors({});
      return;
    }
    setFieldErrors((prev) => {
      const c = { ...prev };
      delete c[fieldPath];
      return c;
    });
  };

  /* ------------------ Save ------------------ */
  // const handleSave = async (status: "draft" | "sent") => {
  //   setSaving(true);
  //   try {
  //     // ensure totals are current
  //     const totals = computeTotals(invoice);

  //     // merge totals into candidate for validation
  //     const candidate: InvoiceModel = { ...invoice, ...totals };

  //     // client-side validation at field level
  //     const fieldLevelErrors = validateAllStepsFields(candidate);
  //     if (fieldLevelErrors.length > 0) {
  //       const firstStep = Math.min(...fieldLevelErrors.map((e) => e.step));
  //       setStep(firstStep);
  //       setErrorsFromArray(fieldLevelErrors);
  //       const msg = formatValidationErrors(fieldLevelErrors);
  //       alert("Please fix the following before saving:\n\n" + msg);
  //       setSaving(false);
  //       return;
  //     }

  //     // Build payload & sanitize
  //     const payload = sanitizePayload({
  //       ...candidate,
  //       status,
  //     } as any);

  //     // Debug payload being sent
  //     console.log("📤 Invoice Payload Debug:");
  //     console.log("📤 Full payload:", JSON.stringify(payload, null, 2));
  //     console.log("📤 Payload keys:", Object.keys(payload));
  //     console.log("📤 Required fields check:");
  //     console.log("📤 - customerName:", payload.billTo?.name || "MISSING");
  //     console.log("📤 - date:", payload.date || "MISSING");
  //     console.log("📤 - items:", payload.items ? `${payload.items.length} items` : "MISSING");
  //     console.log("📤 - total:", payload.total || "MISSING");

  //     // choose PUT when editing (id exists), otherwise POST
  //     const id = (invoice as any)._id || (invoice as any).id;
  //     let res;
  //     if (id) {
  //       // Update existing invoice (backend must accept PUT /api/invoices/:id)
  //       res = await api.put(`/api/invoices/${id}`, payload);
  //     } else {
  //       // Create new invoice
  //       res = await api.post(`/api/invoices`, payload);
  //     }

  //     // backend returns { message, invoice: {...} } or similar
  //     const savedInvoice = (res?.data && (res.data.invoice ?? res.data)) || res.data;

  //     // Notify the app that an invoice was created/updated
  //     window.dispatchEvent(new CustomEvent("invoice:created", { detail: savedInvoice }));

  //     // Friendly user message
  //     alert(id ? "Invoice updated successfully." : "Invoice created successfully.");

  //     // close form
  //     onCancel();
  //   } catch (err: any) {
  //     console.error("Save invoice error:", err);

  //     // Enhanced error debugging
  //     console.log("🚨 Backend Error Debug:");
  //     console.log("🚨 Error status:", err.response?.status);
  //     console.log("🚨 Error data:", err.response?.data);
  //     console.log("🚨 Full error response:", JSON.stringify(err.response, null, 2));

  //     // Handle invalid token specifically - TEMPORARILY DISABLED FOR DEBUGGING
  //     if (err.response?.status === 401 && err.response?.data?.detail === "Invalid token") {
  //       console.log("🔑 Invalid token detected - BUT NOT AUTO-LOGGING OUT FOR DEBUGGING");

  //       // Show error but don't logout automatically
  //       toast({
  //         title: "Authentication Error",
  //         description: "Backend rejected your token. Check console for details.",
  //         variant: "destructive",
  //       });

  //       // DON'T clear tokens or redirect - let user see the error
  //       // return; // Exit early to prevent further error processing
  //     }

  //     // --- robust server-side validation parsing & mapping to inline fields ---
  //     const resp = err?.response?.data;
  //     const serverErrors: ValidationError[] = [];

  //     const fieldToStep = (fieldName: string | undefined) => {
  //       if (!fieldName) return 1;
  //       const f = String(fieldName);
  //       if (f.startsWith("billFrom") || f.startsWith("billTo") || f.startsWith("shipTo") || ["name", "email", "phone", "address", "gst", "pan", "companyName", "businessName", "state"].some(k => f.includes(k))) return 2;
  //       if (f.startsWith("items") || f.startsWith("item") || f.includes("quantity") || f.includes("unitPrice") || f.includes("description")) return 3;
  //       if (["subtotal", "total", "cgst", "sgst", "igst", "shipping", "discount"].some(k => f.includes(k))) return 4;
  //       if (["date", "dueDate", "invoiceNumber", "paymentTerms", "status", "currency"].some(k => f.includes(k))) return 1;
  //       return 1;
  //     };

  //     if (resp && Array.isArray(resp.validation)) {
  //       resp.validation.forEach((it: any) => {
  //         let field: string | undefined;
  //         if (it.instancePath) {
  //           field = it.instancePath.replace(/^\//, "").replace(/\//g, ".");
  //         } else if (it.loc && Array.isArray(it.loc) && it.loc.length >= 2) {
  //           field = it.loc[1];
  //         } else if (it.dataPath) {
  //           field = it.dataPath.replace(/^\./, "").replace(/\//g, ".");
  //         }
  //         const msg = it.message || it.msg || JSON.stringify(it);
  //         serverErrors.push({ step: fieldToStep(field), message: msg, field });
  //       });
  //     } else if (resp && Array.isArray(resp.errors)) {
  //       resp.errors.forEach((it: any) => {
  //         let field = it.param ?? (it.path && (Array.isArray(it.path) ? it.path.join(".") : it.path));
  //         const msg = it.msg ?? it.message ?? JSON.stringify(it);
  //         serverErrors.push({ step: fieldToStep(field), message: msg, field });
  //       });
  //     } else if (resp && resp.detail) {
  //       if (Array.isArray(resp.detail)) {
  //         resp.detail.forEach((d: any) => {
  //           if (typeof d === "string") {
  //             serverErrors.push({ step: 1, message: d });
  //           } else if (d?.loc && Array.isArray(d.loc) && d.loc.length >= 2) {
  //             const field = d.loc[1];
  //             serverErrors.push({ step: fieldToStep(field), message: d.msg || d.message || JSON.stringify(d), field });
  //           } else if (d?.param) {
  //             serverErrors.push({ step: fieldToStep(d.param), message: d.msg || d.message || JSON.stringify(d), field: d.param });
  //           } else {
  //             serverErrors.push({ step: 1, message: JSON.stringify(d) });
  //           }
  //         });
  //       } else if (typeof resp.detail === "object") {
  //         Object.keys(resp.detail).forEach((k) => {
  //           const v = resp.detail[k];
  //           if (Array.isArray(v)) {
  //             v.forEach((m: any) => serverErrors.push({ step: fieldToStep(k), message: String(m), field: k }));
  //           } else {
  //             serverErrors.push({ step: fieldToStep(k), message: String(v), field: k });
  //           }
  //         });
  //       } else if (typeof resp.detail === "string") {
  //         serverErrors.push({ step: 1, message: resp.detail });
  //       }
  //     } else if (resp && typeof resp === "object") {
  //       const potentialFields = Object.keys(resp).filter(k => !["message", "status", "statusCode"].includes(k));
  //       if (potentialFields.length > 0) {
  //         potentialFields.forEach((k) => {
  //           const v = resp[k];
  //           if (typeof v === "string") {
  //             serverErrors.push({ step: fieldToStep(k), message: v, field: k });
  //           } else if (Array.isArray(v)) {
  //             v.forEach((m: any) => serverErrors.push({ step: fieldToStep(k), message: String(m), field: k }));
  //           }
  //         });
  //       }
  //     }

  //     if (serverErrors.length === 0) {
  //       if (resp && resp.message) {
  //         serverErrors.push({ step: 1, message: resp.message });
  //       } else if (err?.message) {
  //         serverErrors.push({ step: 1, message: err.message });
  //       } else {
  //         serverErrors.push({ step: 1, message: "Server validation error. Check console for full response." });
  //       }
  //     }

  //     setFieldErrors((prev) => {
  //       const out: FieldErrors = { ...(prev || {}) };
  //       serverErrors.forEach((e) => {
  //         if (e.field) out[e.field] = e.message;
  //         else out[`_step_${e.step}`] = e.message;
  //       });
  //       return out;
  //     });

  //     const firstStep = Math.min(...serverErrors.map((s) => s.step || 1));
  //     setStep(firstStep);

  //     const shortMsgs = serverErrors.slice(0, 6).map((s, i) => `${i + 1}. ${s.message}${s.field ? ` (${s.field})` : ""}`);
  //     alert("Server validation failed. Fix the highlighted fields.\n\n" + shortMsgs.join("\n"));

  //     console.info("Parsed server validation errors:", serverErrors);
  //     console.debug("Full server response (for debugging):", resp);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      // ensure totals are current
      const totals = computeTotals(invoice);

      // merge totals into candidate for validation
      const candidate: InvoiceModel = { ...invoice, ...totals };

      // Build payload & sanitize
      const payload = sanitizePayload({
        ...candidate,
        status: "draft",
      } as any);

      // Debug payload being sent
      console.log("📤 Draft Invoice Payload Debug:");
      console.log("📤 Full payload:", JSON.stringify(payload, null, 2));

      // choose PUT when editing (id exists), otherwise POST
      const id = (invoice as any)._id || (invoice as any).id;
      let res;
      if (id) {
        // Update existing invoice
        res = await api.put(`/api/invoices/${id}`, payload);
      } else {
        // Create new invoice
        res = await api.post(`/api/invoices`, payload);
      }

      // backend returns { message, invoice: {...} } or similar
      const savedInvoice = (res?.data && (res.data.invoice ?? res.data)) || res.data;

      // Notify the app that an invoice was created/updated
      window.dispatchEvent(new CustomEvent("invoice:created", { detail: savedInvoice }));

      // Show success alert
      alert("Invoice saved as draft successfully!");

      // Clear draft data on successful save
      clearSavedState();

      // close form
      onCancel();
    } catch (err: any) {
      console.error("Save draft invoice error:", err);

      // Show error alert
      alert(`Failed to save draft: ${err.response?.data?.message || err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Function to update inventory stock after invoice creation (bulk API)
  const updateInventoryStockAfterInvoice = async (items: any[]) => {
    try {
      const payloadItems = (items || [])
        .filter((it: any) => it.inventoryItemId && Number(it.quantity) > 0)
        .map((it: any) => ({ inventoryItemId: Number(it.inventoryItemId), quantity: Number(it.quantity) }));

      if (payloadItems.length === 0) return;

      console.log('📦 Updating inventory stock (bulk) for items:', payloadItems);
      const res = await updateInventoryStockBulk({ operation: "remove", items: payloadItems });

      if (!res?.success) {
        throw new Error(res?.message || 'Inventory stock update failed');
      }

      // Notify inventory components to refresh
      window.dispatchEvent(new CustomEvent("inventory:stock-updated", { 
        detail: { updatedItems: res.data?.updates || [] }
      }));
    } catch (error) {
      console.error('❌ Error updating inventory stock (bulk):', error);
    }
  };

  // New: Handle Save (status = "save")
  const handleSave = async () => {
    setSaving(true);
    try {
      // ensure totals are current
      const totals = computeTotals(invoice);

      // merge totals into candidate for validation
      const candidate: InvoiceModel = { ...invoice, ...totals };

      // Build payload with new API structure according to backend API reference
      const payload = sanitizePayload({
        // Client information (flattened structure as per backend API)
        clientName: candidate.billTo?.name || candidate.billTo?.companyName || "",
        clientEmail: candidate.billTo?.email || "",
        clientPhone: candidate.billTo?.phone || "",
        clientAddress: candidate.billTo?.address || "",
        clientCity: candidate.billTo?.city || "",
        clientState: candidate.billTo?.state || "",
        clientCountry: candidate.billTo?.country || "India",
        clientGst: candidate.billTo?.gstNumber || candidate.billTo?.gst || "",
        clientPan: candidate.billTo?.panNumber || candidate.billTo?.pan || "",
        clientZipCode: candidate.billTo?.zipCode || "",
        
        // Invoice metadata - send invoiceNumber if provided, backend will auto-generate if empty
        // Backend will auto-generate if invoiceNumber is empty or not provided
        ...(candidate.invoiceNumber && candidate.invoiceNumber.trim() && {
          invoiceNumber: candidate.invoiceNumber.trim()
        }),
        
        date: candidate.date,
        dueDate: candidate.dueDate,
        status: mapToBackendStatus(candidate.status || "SAVE"),
        currency: candidate.currency || "INR",
        
        // Items and totals - ensure items have inventoryItemId for stock tracking
        items: (candidate.items || []).map(item => ({
          description: item.description || "",
          hsn: item.hsn || "",
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          discount: Number(item.discount) || 0,
          gstRate: Number(item.gst) || 0,
          inventoryItemId: item.inventoryItemId || null, // Critical for stock tracking
        })),
        subtotal: candidate.subtotal || 0,
        discount: candidate.discount || 0,
        shipping: candidate.shipping || 0,
        roundOff: candidate.roundOff || 0,
        totalTax: (candidate.cgst || 0) + (candidate.sgst || 0) + (candidate.igst || 0),
        amount: candidate.total || 0,
        
        // Additional fields
        notes: candidate.notes || "",
        termsAndConditions: candidate.termsAndConditions || "",
        
        // Billing and shipping states for GST calculation
        billingState: candidate.billFrom?.state || "",
        shippingState: candidate.billTo?.state || "",
      } as any);

      console.log('🔄 Invoice payload being sent to backend:', payload);

      // Debug payload being sent
      console.log("💾 Save Invoice Payload Debug:");
      console.log("💾 Full payload:", JSON.stringify(payload, null, 2));

      // Before save: check inventory availability
      const availabilityCheckItems = (candidate.items || [])
        .filter((it: any) => it.inventoryItemId && Number(it.quantity) > 0)
        .map((it: any) => ({ inventoryItemId: Number(it.inventoryItemId), quantity: Number(it.quantity) }));

      if (availabilityCheckItems.length > 0) {
        const availability = await checkInventoryAvailability(availabilityCheckItems);
        if (!availability?.success || !availability?.data?.available) {
          const errors = (availability?.data?.errors || []).map((e: any) => `Item ${e.itemId}: ${e.message}`);
          alert(`Insufficient stock for one or more items.\n${errors.join('\n')}`);
          setSaving(false);
          return;
        }
      }

      // choose PUT when editing (id exists), otherwise POST
      const id = (invoice as any)._id || (invoice as any).id;
      let res;
      if (id) {
        // Update existing invoice
        res = await api.put(`/api/invoices/${id}`, payload);
      } else {
        // Create new invoice
        res = await api.post(`/api/invoices`, payload);
      }

      // Handle backend response according to API reference guide
      if (res?.data?.success) {
        const responseData = res.data.data;
        const invoiceNumber = responseData?.invoiceNumber || responseData?.number;
        
        console.log('✅ Invoice created successfully:', {
          id: responseData?.id,
          invoiceNumber: invoiceNumber,
          amount: responseData?.amount
        });

        // Update inventory stock after successful invoice creation
        if (candidate.items && candidate.items.length > 0) {
          await updateInventoryStockAfterInvoice(candidate.items);
        }

        // Notify the app that an invoice was created/updated
        window.dispatchEvent(new CustomEvent("invoice:created", { 
          detail: { 
            ...responseData, 
            invoiceNumber: invoiceNumber 
          } 
        }));

        // Show success alert with invoice number
        alert(`Invoice saved successfully! Invoice Number: ${invoiceNumber || 'Generated by backend'}`);
      } else {
        throw new Error(res?.data?.message || 'Failed to create invoice');
      }

      // Clear draft data on successful save
      clearSavedState();

      // Refresh next invoice number for the next invoice
      window.dispatchEvent(new CustomEvent("refresh-next-invoice-number"));

      // close form
      onCancel();
    } catch (err: any) {
      console.error("Save invoice error:", err);

      // Show error alert
      alert(`Failed to save invoice: ${err.response?.data?.message || err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Handler to open print preview modal
  const handleOpenPrintPreview = () => {
    // compute totals (optional, but keeps top-level fields current)
    const totals = computeTotals(invoice); 
    
    // Create a candidate object with the latest state and computed totals
    const candidate: InvoiceModel = { 
        ...invoice, 
        ...totals 
    };
    
    // ❌ CRITICAL FIX: The sanitizePayload function is designed for final API SAVE, 
    // NOT for FRONTEND PREVIEW. It strips out computed/item-level tax fields 
    // which the PrintPreview component needs. REMOVE the sanitation step here.
    
    // const sanitized = sanitizePayload(candidate); // ❌ REMOVE THIS LINE ENTIRELY
    
    // ✅ Use the candidate directly which contains the correct calculated item fields.
    setPreviewInvoice(candidate); 
  };

  const handleClosePreview = () => {
    setPreviewInvoice(null);
  };

  /* ------------- New: Next button handler that validates current step ------------- */
  const handleNext = () => {
    // compute totals for validation (do not mutate invoice state here)
    const totals = computeTotals(invoice);
    const candidate = { ...invoice, ...totals };

    const errs = validateStepFields(step, candidate);
    if (errs.length > 0) {
      setErrorsFromArray(errs);
      setStep(step);
      return;
    }

    setFieldErrors((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        if (k.startsWith("_step_") && k.includes(String(step))) delete copy[k];
        if (step === 1 && k === "date") delete copy[k];
        if (step === 2 && (k.startsWith("billTo") || k.startsWith("billFrom"))) delete copy[k];
        if (step === 3 && k.startsWith("items")) delete copy[k];
        if (step === 4 && k === "total") delete copy[k];
      });
      return copy;
    });

    recalcTotals();
    nextStep();
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoice,
        setInvoice,
        recalcTotals,
        fieldErrors,
        setFieldErrors,
        clearFieldError,
      } as any}
    >
      <div className="w-full px-2 sm:px-6 lg:px-8 py-6">
        {/* Draft indicator */}
        {hasSavedState && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              💾 Draft saved automatically. Your changes will be preserved if you navigate away.
            </p>
          </div>
        )}
        
        <StepIndicator currentStep={step} steps={steps} />

        <div className="mt-6">
          {step === 1 && <Step1Form />}
          {step === 2 && <Step2Form />}
          {step === 3 && <Step3Form />}
          {step === 4 && <Step4Form />}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 gap-4">
          <button
            onClick={handleCancel}
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
                  handleNext();
                }}
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-b from-purple-500 to-purple-700 text-white font-semibold rounded-md hover:opacity-90 transition duration-200"
              >
                Next
              </button>
            )}

            {step === 4 && (
              <>
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-b from-green-500 to-green-700 text-white font-semibold rounded-md hover:opacity-90 transition duration-200"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => handleSaveDraft()}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2 border-3 border-[#785FDA] text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition duration-200"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleOpenPrintPreview}
                  className="w-full sm:w-auto px-6 py-2 border-3 border-[#785FDA] text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition duration-200"
                >
                  Print Preview
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {previewInvoice && (
        <PrintPreview invoice={previewInvoice} onClose={handleClosePreview} />
      )}
    </InvoiceContext.Provider>
  );
}

/* ---------------- Helper functions (kept after component to avoid hoist issues) ---------------- */

function validateStepFields(s: number, inv: InvoiceModel): ValidationError[] {
  const errs: ValidationError[] = [];
  if (s === 1) {
    if (!inv.date) {
      errs.push({ step: 1, message: "Invoice date is required.", field: "date" });
    } else {
      const d = new Date(inv.date);
      if (Number.isNaN(d.getTime())) {
        errs.push({ step: 1, message: "Invoice date is invalid. Use YYYY-MM-DD.", field: "date" });
      }
    }
  } else if (s === 2) {
    const bFrom: any = (inv as any).billFrom || {};
    if (!bFrom.businessName || String(bFrom.businessName).trim() === "") {
      errs.push({ step: 2, message: "Seller business name is required.", field: "billFrom.businessName" });
    }
    if (!bFrom.address || String(bFrom.address).trim() === "") {
      errs.push({ step: 2, message: "Seller address is required.", field: "billFrom.address" });
    }
    if (!bFrom.state || String(bFrom.state).trim() === "") {
      errs.push({ step: 2, message: "Seller state is required.", field: "billFrom.state" });
    }
    const bFromEmail = (bFrom.email || "").toString().trim();
    const bFromPhone = (bFrom.phone || "").toString().trim();
    if (!bFromEmail && !bFromPhone) {
      errs.push({ step: 2, message: "Provide seller email or phone.", field: "billFrom.email" });
      errs.push({ step: 2, message: "Provide seller email or phone.", field: "billFrom.phone" });
    } else if (bFromEmail && !isValidEmail(bFromEmail)) {
      errs.push({ step: 2, message: "Seller email appears invalid.", field: "billFrom.email" });
    }

    const name = inv.billTo?.name?.toString().trim();
    const email = inv.billTo?.email?.toString().trim();
    const phone = inv.billTo?.phone?.toString().trim();
    if (!name) {
      errs.push({ step: 2, message: "Customer name (Bill To) is required.", field: "billTo.name" });
    }
    if (!email && !phone) {
      errs.push({ step: 2, message: "Provide customer email or phone.", field: "billTo.email" });
      errs.push({ step: 2, message: "Provide customer email or phone.", field: "billTo.phone" });
    } else if (email && !isValidEmail(email)) {
      errs.push({ step: 2, message: "Customer email appears invalid.", field: "billTo.email" });
    }
  } else if (s === 3) {
    const items = inv.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      errs.push({ step: 3, message: "At least one invoice item is required.", field: "items" });
    } else {
      items.forEach((it: any, idx: number) => {
        const idxDisplay = idx + 1;
        const desc = (it.description || "").toString().trim();
        const qty = Number(it.quantity || 0);
        const up = Number(it.unitPrice || 0);
        if (!desc) {
          errs.push({
            step: 3,
            message: `Item ${idxDisplay}: description is required.`,
            field: `items.${idx}.description`,
          });
        }
        if (!(qty > 0)) {
          errs.push({
            step: 3,
            message: `Item ${idxDisplay}: quantity must be greater than 0.`,
            field: `items.${idx}.quantity`,
          });
        }
        if (Number.isNaN(up) || up < 0) {
          errs.push({
            step: 3,
            message: `Item ${idxDisplay}: unit price must be >= 0.`,
            field: `items.${idx}.unitPrice`,
          });
        }
      });
    }
  } else if (s === 4) {
    const totals = (function computeTotalsLocal(invLocal: InvoiceModel) {
      const items = invLocal.items || [];
      let subtotal = 0;
      let totalGst = 0;
      items.forEach((it: any) => {
        const q = Number(it.quantity || 0);
        const up = Number(it.unitPrice || 0);
        const gst = Number(it.gst || 0);
        const disc = Number(it.discount) || 0;
        const base = q * up;
        const gstAmt = (base * gst) / 100;
        subtotal += base - disc;
        totalGst += gstAmt;
      });
      const total = +(subtotal + totalGst).toFixed(2);
      return { total };
    })(inv);
    if ((totals.total || 0) <= 0) {
      errs.push({
        step: 4,
        message: "Invoice total is zero. Confirm items/prices before saving.",
        field: "total",
      });
    }
  }
  return errs;
}

// function validateAllStepsFields(inv: InvoiceModel) {
//   const all: ValidationError[] = [];
//   for (let s = 1; s <= 4; s++) {
//     all.push(...validateStepFields(s, inv));
//   }
//   return all;
// }
