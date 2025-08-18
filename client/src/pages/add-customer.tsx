import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1Form from "@/components/customer-form/Step1Form";
import Step2Form from "@/components/customer-form/Step2Form";
import Step3Form from "@/components/customer-form/Step3Form";
import Step4Form from "@/components/customer-form/Step4Form";
import { InfoIcon, MapPin, Receipt } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

type Props = {
  onCancel: () => void;
};

const steps = [
  { label: "Basic Information", icon: MapPin },
  { label: "Address Details", icon: MapPin },
  { label: "Tax and Other Details", icon: Receipt },
  { label: "Other Additional Info", icon: InfoIcon },
];

export default function MultiStepForm({ onCancel }: Props) {
  const [step, setStep] = useState(1);

  // 🔹 Central state for all form data
  const [formData, setFormData] = useState<any>({
    // Step 1
    customerType: "",
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    website: "",

    // Step 2
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",

    // Step 3
    pan: "",
    documents: [],
    gstRegistered: "",
    gstNumber: "",
    supplyPlace: "",
    currency: "INR",
    paymentTerms: "",

    // Step 4
    logo: null,
    notes: "",
    tags: "",
  });

  const nextStep = async () => {
    if (step === 4) {
      try {
        const token = Cookies.get("authToken");

        // 🔹 Convert to multipart form-data
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
          if (key === "documents" && Array.isArray(formData.documents)) {
            formData.documents.forEach((file: File) =>
              data.append("documents", file)
            );
          } else if (formData[key] !== null) {
            data.append(key, formData[key]);
          }
        });

        const res = await axios.post(
          "https://invoice-backend-604217703209.asia-south1.run.app/api/customers",
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        console.log("Customer added:", res.data);
        alert(" Customer added successfully!");
        onCancel(); // go back to customer list
      } catch (err: any) {
        console.error("Error adding customer:", err.response || err);
        alert(
          `❌ Failed to add customer: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    } else {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="p-8">
      <StepIndicator currentStep={step} steps={steps} />

      <div className="mt-6">
        {step === 1 && (
          <Step1Form formData={formData} setFormData={setFormData} />
        )}
        {step === 2 && (
          <Step2Form formData={formData} setFormData={setFormData} />
        )}
        {step === 3 && (
          <Step3Form formData={formData} setFormData={setFormData} />
        )}
        {step === 4 && (
          <Step4Form formData={formData} setFormData={setFormData} />
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>

        <div className="flex space-x-4">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-2 border-2 border-purple-700 text-purple-700 font-semibold rounded-md hover:bg-purple-50 transition duration-200"
            >
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-gradient-to-b from-purple-500 to-purple-700 text-white font-semibold rounded-md hover:opacity-90 transition duration-200"
          >
            {step === 4 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
