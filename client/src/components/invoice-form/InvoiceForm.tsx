// client/src/components/invoice-form/InvoiceForm.tsx
import { useEffect, useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1Form from "./Step1Form";
import Step2Form from "./Step2Form";
import Step3Form from "./Step3Form";
import Step4Form from "./Step4Form";
import { BanknoteX, CurlyBraces, LocationEdit, Pin } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

import { InvoiceContext } from "@/contexts/InvoiceContext";
import type { InvoiceModel } from "@/contexts/InvoiceContext";

import PrintPreview from "./Print-preview"; // added import

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

const API_BASE = "https://invoice-backend-604217703209.asia-south1.run.app";

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
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    billFrom: {
      businessName: "",
      address: "",
      state: "",
      email: "",
      phone: "",
      gst: "",
    },
    billTo: {
      name: "",
      email: "",
      address: "",
      state: "",
      gst: "",
      gstin: "",
      pan: "",
      phone: "",
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

  // use initialData if provided (edit mode) otherwise default
  const [invoice, setInvoice] = useState<InvoiceModel>(initialData || defaultInvoice);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // new: state for print preview modal (holds sanitized invoice for preview)
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceModel | null>(null);

  // Field-level inline errors mapping: fieldPath -> message
  type FieldErrors = Record<string, string>;
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // If parent provides initialData later (e.g. via event) update local state
  useEffect(() => {
    if (initialData) {
      // merge to avoid losing fields not present in initialData
      setInvoice((prev) => ({ ...prev, ...initialData }));
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

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

    // Ensure billFrom exists
    cleaned.billFrom = {
      businessName: payload.billFrom?.businessName ?? "",
      address: payload.billFrom?.address ?? "",
      state:
        payload.billFrom?.state !== undefined && payload.billFrom?.state !== null
          ? String(payload.billFrom.state)
          : "NA",
      email: payload.billFrom?.email ?? "",
      phone: payload.billFrom?.phone ?? "",
      gst: payload.billFrom?.gst ?? "",
    };

    // Ensure billTo exists and contains required keys (provide safe defaults)
    cleaned.billTo = {
      name: payload.billTo?.name ?? "",
      email: payload.billTo?.email ?? "",
      address: payload.billTo?.address ?? "",
      state:
        payload.billTo?.state !== undefined && payload.billTo?.state !== null
          ? String(payload.billTo.state)
          : "NA",
      gst: payload.billTo?.gst ?? "",
      pan: payload.billTo?.pan ?? "",
      phone: payload.billTo?.phone ?? "",
      companyName: payload.billTo?.companyName ?? (payload.billTo?.name ?? ""),
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
  // const validateInvoice = (inv: InvoiceModel): ValidationError[] => {
  //   const errors: ValidationError[] = [];

  //   // Step 1: Invoice Details
  //   if (!inv.date) {
  //     errors.push({ step: 1, message: "Invoice date is required." });
  //   } else {
  //     const d = new Date(inv.date);
  //     if (Number.isNaN(d.getTime())) {
  //       errors.push({ step: 1, message: "Invoice date is invalid. Use YYYY-MM-DD." });
  //     }
  //   }

  //   // Step 2: Seller (billFrom) required checks
  //   const bFrom = (inv as any).billFrom || {};
  //   if (!bFrom.businessName || String(bFrom.businessName).trim() === "") {
  //     errors.push({ step: 2, message: "Seller business name is required." });
  //   }
  //   if (!bFrom.address || String(bFrom.address).trim() === "") {
  //     errors.push({ step: 2, message: "Seller address is required." });
  //   }
  //   if (!bFrom.state || String(bFrom.state).trim() === "") {
  //     errors.push({ step: 2, message: "Seller state is required." });
  //   }
  //   const bFromEmail = (bFrom.email || "").toString().trim();
  //   const bFromPhone = (bFrom.phone || "").toString().trim();
  //   if (!bFromEmail && !bFromPhone) {
  //     errors.push({ step: 2, message: "Provide at least one seller contact: email or phone." });
  //   } else if (bFromEmail && !isValidEmail(bFromEmail)) {
  //     errors.push({ step: 2, message: "Seller email appears invalid." });
  //   }

  //   // Step 2: Party Details (billTo)
  //   const name = inv.billTo?.name?.toString().trim();
  //   const email = inv.billTo?.email?.toString().trim();
  //   const phone = inv.billTo?.phone?.toString().trim();
  //   if (!name) {
  //     errors.push({ step: 2, message: "Customer name (Bill To) is required." });
  //   }
  //   if (!email && !phone) {
  //     errors.push({ step: 2, message: "Provide at least one contact: customer email or phone." });
  //   } else if (email && !isValidEmail(email)) {
  //     errors.push({ step: 2, message: "Customer email appears invalid." });
  //   }

  //   // Step 3: Item Details
  //   const items = inv.items || [];
  //   if (!Array.isArray(items) || items.length === 0) {
  //     errors.push({ step: 3, message: "At least one invoice item is required." });
  //   } else {
  //     items.forEach((it: any, idx: number) => {
  //       const idxDisplay = idx + 1;
  //       const desc = (it.description || "").toString().trim();
  //       const qty = Number(it.quantity || 0);
  //       const up = Number(it.unitPrice || 0);
  //       if (!desc) {
  //         errors.push({ step: 3, message: `Item ${idxDisplay}: description is required.` });
  //       }
  //       if (!(qty > 0)) {
  //         errors.push({ step: 3, message: `Item ${idxDisplay}: quantity must be greater than 0.` });
  //       }
  //       if (Number.isNaN(up) || up < 0) {
  //         errors.push({ step: 3, message: `Item ${idxDisplay}: unit price must be >= 0.` });
  //       }
  //     });
  //   }

  //   // Step 4: totals check (non-blocking - show warning if zero)
  //   const totals = computeTotals(inv);
  //   if ((totals.total || 0) <= 0) {
  //     // show as an error because saving a zero-total invoice is often a mistake
  //     errors.push({ step: 4, message: "Invoice total is zero. Confirm items/prices before saving." });
  //   }

  //   return errors;
  // };

  const formatValidationErrors = (errs: ValidationError[]) => {
    // group by step for a nicer message
    if (!errs || errs.length === 0) return "";
    // sort by step
    errs.sort((a, b) => a.step - b.step);
    const grouped: Record<number, string[]> = {};
    errs.forEach((e) => {
      grouped[e.step] = grouped[e.step] || [];
      grouped[e.step].push(e.message);
    });
    const stepLabels = ["", "Invoice Details", "Party Details", "Item Details", "Sub Total"];
    const lines: string[] = [];
    Object.keys(grouped).forEach((s) => {
      const stepNum = Number(s);
      lines.push(`${stepLabels[stepNum] || "Step " + stepNum}:`);
      grouped[stepNum].forEach((m) => lines.push(` • ${m}`));
    });
    return lines.join("\n");
  };

  /* Helper: convert ValidationError[] to fieldErrors map and set state */
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
  const handleSave = async (status: "draft" | "sent") => {
    setSaving(true);
    try {
      // ensure totals are current
      const totals = computeTotals(invoice);

      // merge totals into candidate for validation
      const candidate: InvoiceModel = { ...invoice, ...totals };

      // client-side validation at field level
      const fieldLevelErrors = validateAllStepsFields(candidate);
      if (fieldLevelErrors.length > 0) {
        // jump to the first step with an error to help user
        const firstStep = Math.min(...fieldLevelErrors.map((e) => e.step));
        setStep(firstStep);
        setErrorsFromArray(fieldLevelErrors);
        const msg = formatValidationErrors(fieldLevelErrors);
        alert("Please fix the following before saving:\n\n" + msg);
        setSaving(false);
        return;
      }

      // Build payload & sanitize
      const payload = sanitizePayload({
        ...candidate,
        status,
      } as any);

      // token: support localStorage and common cookie names
      const cookieToken =
        Cookies.get("token") ||
        Cookies.get("authToken") ||
        Cookies.get("bearer") ||
        Cookies.get("access_token");
      const token = localStorage.getItem("token") || cookieToken || undefined;

      const axiosConfig: any = {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }, // explicit content-type
      };
      if (token) {
        axiosConfig.headers.Authorization = `Bearer ${token}`;
      }

      // choose PUT when editing (id exists), otherwise POST
      const id = (invoice as any)._id || (invoice as any).id;
      let res;
      if (id) {
        // Update existing invoice (backend must accept PUT /api/invoices/:id)
        res = await axios.put(`${API_BASE}/api/invoices/${id}`, payload, axiosConfig);
      } else {
        // Create new invoice
        res = await axios.post(`${API_BASE}/api/invoices`, payload, axiosConfig);
      }

      // backend returns { message, invoice: {...} } or similar
      const savedInvoice = (res?.data && (res.data.invoice ?? res.data)) || res.data;

      // Notify the app that an invoice was created/updated
      window.dispatchEvent(new CustomEvent("invoice:created", { detail: savedInvoice }));

      // Friendly user message
      alert(id ? "Invoice updated successfully." : "Invoice created successfully.");

      // close form
      onCancel();
    } catch (err: any) {
      console.error("Save invoice error:", err);

      // --- NEW: robust server-side validation parsing & mapping to inline fields ---
      const resp = err?.response?.data;
      const serverErrors: ValidationError[] = [];

      // helper: map field name to step — now includes billFrom
      const fieldToStep = (fieldName: string | undefined) => {
        if (!fieldName) return 1;
        const f = String(fieldName);
        if (f.startsWith("billFrom") || f.startsWith("billTo") || f.startsWith("shipTo") || ["name","email","phone","address","gst","pan","companyName","businessName","state"].some(k => f.includes(k))) return 2;
        if (f.startsWith("items") || f.startsWith("item") || f.includes("quantity") || f.includes("unitPrice") || f.includes("description")) return 3;
        if (["subtotal","total","cgst","sgst","igst","shipping","discount"].some(k => f.includes(k))) return 4;
        if (["date","dueDate","invoiceNumber","paymentTerms","status","currency"].some(k => f.includes(k))) return 1;
        return 1;
      };

      // Case 1: Fastify/AJV style error object (has 'validation' or 'validation' array OR 'message' plus details)
      if (resp && Array.isArray(resp.validation)) {
        resp.validation.forEach((it: any) => {
          // try instancePath or loc
          let field: string | undefined;
          if (it.instancePath) {
            field = it.instancePath.replace(/^\//, "").replace(/\//g, ".");
          } else if (it.loc && Array.isArray(it.loc) && it.loc.length >= 2) {
            field = it.loc[1];
          } else if (it.dataPath) {
            field = it.dataPath.replace(/^\./, "").replace(/\//g, ".");
          }
          const msg = it.message || it.msg || JSON.stringify(it);
          serverErrors.push({ step: fieldToStep(field), message: msg, field });
        });
      }
      // Case 2: express-validator / Joi / other: resp.errors array of { param, msg } or { message, path }
      else if (resp && Array.isArray(resp.errors)) {
        resp.errors.forEach((it: any) => {
          let field = it.param ?? (it.path && (Array.isArray(it.path) ? it.path.join(".") : it.path));
          const msg = it.msg ?? it.message ?? JSON.stringify(it);
          serverErrors.push({ step: fieldToStep(field), message: msg, field });
        });
      }
      // Case 3: resp.detail can be object mapping field->message or array of messages
      else if (resp && resp.detail) {
        if (Array.isArray(resp.detail)) {
          resp.detail.forEach((d: any) => {
            if (typeof d === "string") {
              serverErrors.push({ step: 1, message: d });
            } else if (d?.loc && Array.isArray(d.loc) && d.loc.length >= 2) {
              const field = d.loc[1];
              serverErrors.push({ step: fieldToStep(field), message: d.msg || d.message || JSON.stringify(d), field });
            } else if (d?.param) {
              serverErrors.push({ step: fieldToStep(d.param), message: d.msg || d.message || JSON.stringify(d), field: d.param });
            } else {
              serverErrors.push({ step: 1, message: JSON.stringify(d) });
            }
          });
        } else if (typeof resp.detail === "object") {
          Object.keys(resp.detail).forEach((k) => {
            const v = resp.detail[k];
            if (Array.isArray(v)) {
              v.forEach((m: any) => serverErrors.push({ step: fieldToStep(k), message: String(m), field: k }));
            } else {
              serverErrors.push({ step: fieldToStep(k), message: String(v), field: k });
            }
          });
        } else if (typeof resp.detail === "string") {
          serverErrors.push({ step: 1, message: resp.detail });
        }
      }
      // Case 4: resp is an object of { field: message } or { errors: { field: msg } }
      else if (resp && typeof resp === "object") {
        // check for simple mapping
        const potentialFields = Object.keys(resp).filter(k => !["message","status","statusCode"].includes(k));
        if (potentialFields.length > 0) {
          potentialFields.forEach((k) => {
            const v = resp[k];
            if (typeof v === "string") {
              serverErrors.push({ step: fieldToStep(k), message: v, field: k });
            } else if (Array.isArray(v)) {
              v.forEach((m: any) => serverErrors.push({ step: fieldToStep(k), message: String(m), field: k }));
            }
          });
        }
      }

      // Fallback: if we couldn't parse anything, fall back to generic message(s)
      if (serverErrors.length === 0) {
        // try some common spots
        if (resp && resp.message) {
          serverErrors.push({ step: 1, message: resp.message });
        } else if (err?.message) {
          serverErrors.push({ step: 1, message: err.message });
        } else {
          serverErrors.push({ step: 1, message: "Server validation error. Check console for full response." });
        }
      }

      // Convert serverErrors into fieldErrors map and set into context
      setFieldErrors((prev) => {
        const out: FieldErrors = { ...(prev || {}) };
        serverErrors.forEach((e) => {
          if (e.field) out[e.field] = e.message;
          else out[`_step_${e.step}`] = e.message;
        });
        return out;
      });

      // Jump to first step containing error
      const firstStep = Math.min(...serverErrors.map((s) => s.step || 1));
      setStep(firstStep);

      // Friendly short alert (do not dump raw JSON)
      const shortMsgs = serverErrors.slice(0, 6).map((s, i) => `${i + 1}. ${s.message}${s.field ? ` (${s.field})` : ""}`);
      alert("Server validation failed. Fix the highlighted fields.\n\n" + shortMsgs.join("\n"));

      // keep console with full server response for debugging
      console.info("Parsed server validation errors:", serverErrors);
      console.debug("Full server response (for debugging):", resp);

    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndSend = async () => {
    await handleSave("sent");
  };

  const handleSaveDraft = async () => {
    console.log("Draft Save")
  };

  // Handler to open print preview modal
  const handleOpenPrintPreview = () => {
    // compute current totals (do not mutate main invoice state here)
    const totals = computeTotals(invoice);
    const candidate: InvoiceModel = { ...invoice, ...totals };
    const sanitized = sanitizePayload(candidate);
    setPreviewInvoice(sanitized);
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
      // Jump to same step (helps UX) — keep user on step with inline errors visible
      setStep(step);
      return;
    }

    // clear errors for this step then advance
    // remove any _step_x or fields belonging to this step
    setFieldErrors((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        if (k.startsWith("_step_") && k.includes(String(step))) delete copy[k];
        // also remove fields that start with step-specific prefixes
        if (step === 1 && k === "date") delete copy[k];
        if (step === 2 && (k.startsWith("billTo") || k.startsWith("billFrom"))) delete copy[k];
        if (step === 3 && k.startsWith("items")) delete copy[k];
        if (step === 4 && k === "total") delete copy[k];
      });
      return copy;
    });

    // recalc totals (to keep main state in sync) and then go to next step
    recalcTotals();
    nextStep();
  };

  return (
    <InvoiceContext.Provider
      // cast to any because context shape may be defined elsewhere;
      // we intentionally add fieldErrors & helpers for step forms to consume.
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
                  // validate current step before advancing
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
                  onClick={() => handleSaveDraft()}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2 border-3 border-[#785FDA] text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition duration-200"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleOpenPrintPreview} // wired up to open preview
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

      {/* Render print preview modal when previewInvoice is set */}
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
    // seller (billFrom) checks
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

    // customer (billTo) checks
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

function validateAllStepsFields(inv: InvoiceModel) {
  const all: ValidationError[] = [];
  for (let s = 1; s <= 4; s++) {
    all.push(...validateStepFields(s, inv));
  }
  return all;
}
