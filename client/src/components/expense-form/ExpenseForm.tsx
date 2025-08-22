// client/src/components/expense-form/ExpenseForm.tsx

import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1Form from "./Step1Form";
import Step2Form from "./Step2Form";
import Step3Form from "./Step3Form";
import Step4Form from "./Step4Form";
import { BanknoteX, CurlyBraces, LocationEdit, Pin } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";   // ✅ use js-cookie like InvoiceForm

type Props = {
  onCancel: () => void;
};

type Item = {
  id?: number | string;
  name: string;
  hsn: string;
  qty: number;
  price: number;
  gst: number;
  discount: number;
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
};

const steps = [
  { label: "Expense Information", icon: Pin },
  { label: "Vendor Details", icon: LocationEdit },
  { label: "Item Details", icon: BanknoteX },
  { label: "Sub Total", icon: CurlyBraces },
];

export default function ExpenseForm({ onCancel }: Props) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<ExpenseFormShape>({
    step1: {},
    step2: {},
    step3: {
      items: [{ id: Date.now(), name: "", hsn: "", qty: 0, price: 0, gst: 0, discount: 0 }],
    },
    step4: {},
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateStep = <T extends keyof ExpenseFormShape>(stepKey: T, value: ExpenseFormShape[T]) => {
    setFormData((prev) => ({ ...prev, [stepKey]: value }));
  };

  const setItems = (items: Item[]) => {
    updateStep("step3", { items });
  };

  const handleSaveAndSend = async () => {
  try {
    const payload: any = JSON.parse(JSON.stringify(formData));

    // normalize dates
    if (payload.step1?.expenseDate) {
      const d = new Date(payload.step1.expenseDate);
      if (!isNaN(d.getTime())) payload.step1.expenseDate = d.toISOString();
    }
    if (payload.step1?.dueDate) {
      const d2 = new Date(payload.step1.dueDate);
      if (!isNaN(d2.getTime())) payload.step1.dueDate = d2.toISOString();
    }

    // ✅ token handling same as InvoiceForm
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

    const res = await axios.post(
      "https://invoice-backend-604217703209.asia-south1.run.app/api/expenses",
      payload,
      axiosConfig
      
    );
    console.log("Expense created response:", res);

    if (res?.status === 201 && res?.data?._id) {
  onCancel();
  window.dispatchEvent(new CustomEvent("expense:created", { detail: res.data }));
  alert("✅ Expense created successfully!");
} else {
  alert("❌ Failed to create expense. Please try again.");
}
  } catch (err: any) {
    console.error("Create expense error:", err);

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
        err.response.data?.detail ||
        err.response.data?.message ||
        err.response.data?.error;
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
                Save and Send
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
