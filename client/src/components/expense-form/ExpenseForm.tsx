// client/src/components/expense-form/ExpenseForm.tsx

import { useEffect, useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1Form from "./Step1Form";
import Step2Form from "./Step2Form";
import Step3Form from "./Step3Form";
import Step4Form from "./Step4Form";
import { BanknoteX, CurlyBraces, LocationEdit, Pin } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie"; // ✅ use js-cookie like InvoiceForm

type Props = {
  onCancel: () => void;
  initialData?: any; // optional: provide an expense object to open form in edit mode
  onSaved?: (updated: any) => void; // optional callback after successful update
  onCreated?: (created: any) => void; // optional callback after successful create
};

// ----- CHANGED: widen numeric fields to accept string during editing (compatible with Step3ItemTable) -----
type Item = {
  id?: number | string;
  name: string;
  hsn: string;
  qty: number | string;
  price: number | string;
  gst: number | string;
  discount: number | string;
};

type ExpenseFormShape = {
  step1: {
    expenseNumber?: string;
    invoiceNumber?: string;
    expenseDate?: string;
    dueDate?: string;
    paymentMethod?: string;
    currency?: string;
    status?: string;
    notes?: string;
  };
  step2: {
    vendorName?: string;
    businessName?: string;
    billingAddress?: string;
    shippingAddress?: string;
    email?: string;
    country?: string;
    phoneNumber?: string;
    state?: string;
    gstin?: string;
    panNumber?: string;
  };
  step3: {
    items: Item[];
  };
  step4: {
    terms?: string;
    subtotal?: number;
    discount?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    shipping?: number;
    total?: number;
  };
}

const steps = [
  { label: "Expense Information", icon: Pin },
  { label: "Vendor Details", icon: LocationEdit },
  { label: "Item Details", icon: BanknoteX },
  { label: "Sub Total", icon: CurlyBraces },
];

const API_BASE = "https://invoice-backend-604217703209.asia-south1.run.app";

export default function ExpenseForm({ onCancel, initialData, onSaved, onCreated }: Props) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<ExpenseFormShape>({
    step1: {},
    step2: {},
    step3: {
      items: [{ id: Date.now(), name: "", hsn: "", qty: 0, price: 0, gst: 0, discount: 0 }],
    },
    step4: {},
  });

  // whether the form is editing an existing expense
  const isEdit = Boolean(initialData);

  // Map incoming initialData to form shape (best-effort)
  const mapInitialToForm = (data: any): ExpenseFormShape => {
    const s1Source = data?.step1 ?? {};
    const s2Source = data?.step2 ?? {};
    const s3Source = data?.step3 ?? {};
    const s4Source = data?.step4 ?? {};

    const safeIsoDate = (val: any) => {
      if (!val) return undefined;
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
      } catch {}
      return undefined;
    };

    const step1 = {
      expenseNumber:
        s1Source.expenseNumber ??
        data.expenseNumber ??
        data.expense_number ??
        s1Source.reference ??
        undefined,
      invoiceNumber: s1Source.invoiceNumber ?? data.invoiceNumber ?? undefined,
      expenseDate:
        s1Source.expenseDate ??
        data.expenseDate ??
        data.expense_date ??
        safeIsoDate(data.date) ??
        undefined,
      dueDate:
        s1Source.dueDate ??
        data.dueDate ??
        data.due_date ??
        safeIsoDate(data.dueDate) ??
        undefined,
      paymentMethod: s1Source.paymentMethod ?? data.paymentMethod ?? undefined,
      currency: s1Source.currency ?? data.currency ?? undefined,
      status: s1Source.status ?? data.status ?? undefined,
      notes: s1Source.notes ?? data.notes ?? undefined,
    };

    const step2 = {
      vendorName: s2Source.vendorName ?? data.vendorName ?? data.vendor ?? undefined,
      businessName: s2Source.businessName ?? data.businessName ?? undefined,
      billingAddress: s2Source.billingAddress ?? data.billingAddress ?? data.address ?? undefined,
      shippingAddress: s2Source.shippingAddress ?? data.shippingAddress ?? undefined,
      email: s2Source.email ?? data.email ?? undefined,
      country: s2Source.country ?? data.country ?? undefined,
      phoneNumber: s2Source.phoneNumber ?? data.phoneNumber ?? data.phone ?? undefined,
      state: s2Source.state ?? data.state ?? undefined,
      gstin: s2Source.gstin ?? data.gstin ?? undefined,
      panNumber: s2Source.panNumber ?? data.panNumber ?? undefined,
    };

    // items: try common shapes
    const itemsCandidate =
      s3Source.items ??
      data.items ??
      data.line_items ??
      data.itemsList ??
      (Array.isArray(data.items) ? data.items : undefined) ??
      [];

    const itemsList: any[] = Array.isArray(itemsCandidate) ? itemsCandidate : [];

    const normalizedItems: Item[] =
      itemsList.length > 0
        ? itemsList.map((it: any, idx: number) => ({
            id: it.id ?? it._id ?? it.key ?? `${Date.now()}_${idx}`,
            name: it.name ?? it.description ?? it.item ?? "",
            hsn: it.hsn ?? it.code ?? "",
            // keep numeric conversion to number here — numbers are assignable to number|string fields
            qty: Number(it.qty ?? it.quantity ?? 0),
            price: Number(it.price ?? it.rate ?? 0),
            gst: Number(it.gst ?? it.tax ?? 0),
            discount: Number(it.discount ?? 0),
          }))
        : [{ id: Date.now(), name: "", hsn: "", qty: 0, price: 0, gst: 0, discount: 0 }];

    const step3 = { items: normalizedItems };

    const step4 = {
      terms: s4Source.terms ?? data.terms ?? undefined,
      subtotal: s4Source.subtotal ?? data.subtotal ?? data.total_before_tax ?? undefined,
      discount: s4Source.discount ?? data.discount ?? undefined,
      cgst: s4Source.cgst ?? data.cgst ?? undefined,
      sgst: s4Source.sgst ?? data.sgst ?? undefined,
      igst: s4Source.igst ?? data.igst ?? undefined,
      shipping: s4Source.shipping ?? data.shipping ?? undefined,
      total: s4Source.total ?? data.total ?? data.grand_total ?? undefined,
    };

    return { step1, step2, step3, step4 };
  };

  useEffect(() => {
    if (initialData) {
      try {
        setFormData((prev) => {
          const mapped = mapInitialToForm(initialData);
          return {
            step1: { ...prev.step1, ...mapped.step1 },
            step2: { ...prev.step2, ...mapped.step2 },
            step3: { ...prev.step3, ...mapped.step3 },
            step4: { ...prev.step4, ...mapped.step4 },
          };
        });
        setStep(1);
      } catch (err) {
        console.error("Failed to map initialData into form:", err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateStep = <T extends keyof ExpenseFormShape>(stepKey: T, value: ExpenseFormShape[T]) => {
    setFormData((prev) => ({ ...prev, [stepKey]: value }));
  };

  const setItems = (items: Item[]) => {
    updateStep("step3", { items });
  };

  const safeDispatch = (eventName: string, payload: any) => {
    try {
      window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
    } catch (err) {
      // ignore dispatch errors
      console.warn("Event dispatch failed", eventName, err);
    }
  };

  const handleSaveAndSend = async () => {
    try {
      const payload: any = JSON.parse(JSON.stringify(formData));

      // normalize dates to ISO if possible (keep only ISO string)
      if (payload.step1?.expenseDate) {
        const d = new Date(payload.step1.expenseDate);
        if (!isNaN(d.getTime())) payload.step1.expenseDate = d.toISOString();
      }
      if (payload.step1?.dueDate) {
        const d2 = new Date(payload.step1.dueDate);
        if (!isNaN(d2.getTime())) payload.step1.dueDate = d2.toISOString();
      }

      // token handling same as InvoiceForm
      const cookieToken =
        Cookies.get("token") ||
        Cookies.get("authToken") ||
        Cookies.get("bearer") ||
        Cookies.get("access_token");

      const token = localStorage.getItem("token") || cookieToken || undefined;

      const axiosConfig: any = {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      };
      if (token) {
        axiosConfig.headers.Authorization = `Bearer ${token}`;
      }

      if (isEdit) {
        // determine id of resource (support different server shapes)
        const id =
          initialData?._id ??
          initialData?.id ??
          initialData?.expenseId ??
          initialData?.expense_number ??
          initialData?.invoiceNumber ??
          initialData?.invoice_id;

        if (!id) {
          alert("❌ Cannot update expense: missing id on initial data.");
          return;
        }

        const res = await axios.put(`${API_BASE}/api/expenses/${id}`, payload, axiosConfig);
        console.log("Expense update response:", res);

        if ((res?.status === 200 || res?.status === 204) && (res?.data || res?.status === 204)) {
          const updated = res.data ?? payload;

          // Prefer parent-provided callback. Only fallback to global event if parent did not supply onSaved.
          if (onSaved) {
            try {
              onSaved(updated);
            } catch (err) {
              console.error("onSaved callback error:", err);
            }
          } else {
            safeDispatch("expense:updated", updated);
          }

          onCancel();
          alert("✅ Expense updated successfully!");
        } else {
          alert("❌ Failed to update expense. Please try again.");
        }
      } else {
        // create new expense
        const res = await axios.post(`${API_BASE}/api/expenses`, payload, axiosConfig);
        console.log("Expense created response:", res);

        if ((res?.status === 201 || res?.status === 200) && res?.data) {
          const created = res.data ?? payload;

          // Prefer parent-provided callback. Only fallback to global event if parent did not supply onCreated.
          if (onCreated) {
            try {
              onCreated(created);
            } catch (err) {
              console.error("onCreated callback error:", err);
            }
          } else {
            safeDispatch("expense:created", created);
          }

          onCancel();
          alert("✅ Expense created successfully!");
        } else {
          alert("❌ Failed to create expense. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Save expense error:", err);

      let userMessage = "❌ Something went wrong. Please try again.";

      if (err?.response) {
        const status = err.response.status;

        // Custom messages by status code
        switch (status) {
          case 400:
            userMessage = "⚠️ Invalid data. Please check the form and try again.";
            break;
          case 401:
            userMessage = "🔒 Unauthorized. Please log in again.";
            break;
          case 403:
            userMessage = "🚫 You don’t have permission to perform this action.";
            break;
          case 404:
            userMessage = "❓ Requested resource not found.";
            break;
          case 500:
            userMessage = "💥 Server error. Please try again later.";
            break;
        }

        // If backend sends specific error detail
        const detail =
          err.response.data?.detail || err.response.data?.message || err.response.data?.error || undefined;
        if (detail) {
          userMessage += `\n\nDetails: ${detail}`;
        }
      } else if (err?.message) {
        userMessage = err.message;
      }

      alert(userMessage);
    }
  };

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8 py-6">
      <StepIndicator currentStep={step} steps={steps} />

      <div className="mt-6">
        {step === 1 && (
          <Step1Form
            data={formData.step1}
            onChange={(d) => updateStep("step1", { ...formData.step1, ...d })}
          />
        )}
        {step === 2 && (
          <Step2Form
            data={formData.step2}
            onChange={(d) => updateStep("step2", { ...formData.step2, ...d })}
          />
        )}
        {step === 3 && <Step3Form items={formData.step3.items} setItems={setItems} />}
        {step === 4 && (
          <Step4Form
            items={formData.step3.items}
            setItems={setItems}
            data={formData.step4}
            onChange={(d) => updateStep("step4", { ...formData.step4, ...d })}
          />
        )}
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
              onClick={nextStep}
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-b from-purple-500 to-purple-700 text-white font-semibold rounded-md hover:opacity-90 transition duration-200"
            >
              Next
            </button>
          )}

          {step === 4 && (
            <>
              <button
                onClick={() => console.log("Save as draft")}
                className="w-full sm:w-auto px-6 py-2 border-3 border-[#785FDA] text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition duration-200"
              >
                Save as Draft
              </button>
              <button
                onClick={() => console.log("Print preview")}
                className="w-full sm:w-auto px-6 py-2 border-3 border-[#785FDA] text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition duration-200"
              >
                Print Preview
              </button>
              <button
                onClick={handleSaveAndSend}
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] text-white font-semibold rounded-md hover:opacity-90 transition duration-200"
              >
                {isEdit ? "Save and Update" : "Save and Send"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
