import { useState } from "react";
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
    expenseDate?: string,
    dueDate?: string ,
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

    // Centralized form data
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

    // helper to update nested step data
    const updateStep = <T extends keyof ExpenseFormShape>(stepKey: T, value: ExpenseFormShape[T]) => {
      setFormData(prev => ({ ...prev, [stepKey]: value }));
    };

    // items helpers (so Step3 and Step4 can share)
    const setItems = (items: Item[]) => {
      updateStep("step3", { items });
    };

    const handleSaveAndSend = async () => {
      try {
        const payload = { ...formData };
    
        // ✅ Normalize date values to ISO strings safely
        if (payload.step1?.expenseDate) {
          payload.step1.expenseDate = new Date(payload.step1.expenseDate).toISOString();
        }
        if (payload.step1?.dueDate) {
          payload.step1.dueDate = new Date(payload.step1.dueDate).toISOString();
        }
    
        const token = localStorage.getItem("token") || "";
    
        const res = await axios.post("/api/expenses", payload, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });
    
        if (res?.data?.success) {
          onCancel();
          window.dispatchEvent(new CustomEvent("expense:created", { detail: res.data.data }));
          alert("Expense created successfully");
        } else {
          console.error("Unexpected response:", res);
          alert("Failed to create expense. Check console for details.");
        }
      } catch (err: any) {
        console.error("Create expense error:", err);
        const msg = err?.response?.data?.detail || err?.message || "Error creating expense";
        alert("Error: " + msg);
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
                {step === 3 && (
                  <Step3Form
                    items={formData.step3.items}
                    setItems={setItems}
                  />
                )}
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
