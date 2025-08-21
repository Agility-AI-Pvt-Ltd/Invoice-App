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

  // Helper: try to extract useful messages from backend validation response
  const extractValidationMessages = (respData: any) => {
    try {
      // Common patterns: { detail: [...] } or { errors: {field: [...] } } or simple message
      if (!respData) return ["Unprocessable content (422)"];
      if (Array.isArray(respData.detail)) {
        return respData.detail.map((d: any) =>
          typeof d === "string" ? d : JSON.stringify(d)
        );
      }
      if (respData.errors && typeof respData.errors === "object") {
        const msgs: string[] = [];
        Object.keys(respData.errors).forEach((k) => {
          const val = respData.errors[k];
          if (Array.isArray(val)) msgs.push(`${k}: ${val.join(", ")}`);
          else msgs.push(`${k}: ${String(val)}`);
        });
        return msgs;
      }
      if (respData.message) return [respData.message];
      // fallback: stringify small
      return [JSON.stringify(respData)];
    } catch (e) {
      console.error("Failed to extract validation messages:", e);
      return ["Unprocessable content (422)"];
    }
  };

  const nextStep = async () => {
    if (step === 4) {
      const token = Cookies.get("authToken");
      // Build a JSON payload without file binaries first (logo/documents removed or normalized)
      const buildJsonPayloadNoFiles = (raw: any) => {
        const payload: any = { ...raw };

        // Remove or normalize file fields so we send pure JSON
        if (payload.logo instanceof File) {
          // remove file binary for JSON attempt — backend may handle files separately
          delete payload.logo;
        } else {
          // keep value if it's string/null
          payload.logo = payload.logo ?? null;
        }

        if (Array.isArray(payload.documents) && payload.documents.length > 0) {
          // If documents contain File objects, remove them for JSON attempt
          const docs = payload.documents.filter((d: any) => !(d instanceof File));
          payload.documents = docs;
        } else {
          payload.documents = [];
        }

        return payload;
      };

      // Build multipart formdata (used as fallback) — append everything, files included
      const buildFormData = (raw: any) => {
        const fd = new FormData();
        Object.keys(raw).forEach((key) => {
          const val = raw[key];
          if (key === "documents" && Array.isArray(val)) {
            val.forEach((item: any) => {
              // append file or metadata
              if (item instanceof File) fd.append("documents", item);
              else if (typeof item === "object") fd.append("documents", JSON.stringify(item));
              else if (item !== undefined && item !== null) fd.append("documents", String(item));
            });
            return;
          }

          if (val instanceof File) {
            fd.append(key, val);
            return;
          }

          // For objects (like nested address objects) stringify them so backend can parse if expecting JSON
          if (typeof val === "object" && val !== null) {
            fd.append(key, JSON.stringify(val));
            return;
          }

          if (val !== undefined && val !== null) {
            fd.append(key, String(val));
          }
        });
        return fd;
      };

      // FIRST: try sending JSON (without files) — many backends expect JSON for customer create
      try {
        const payloadJson = buildJsonPayloadNoFiles(formData);
        console.log("Attempting JSON payload (no file binaries):", payloadJson);

        const res = await axios.post(
          "https://invoice-backend-604217703209.asia-south1.run.app/api/customers",
          payloadJson,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        console.log("✅ Customer added:", res.data);

// dispatch global event so lists can refresh (no UI change)
        window.dispatchEvent(new CustomEvent("customer:added", { detail: res.data }));

        alert("Customer added successfully!");
        onCancel(); // go back to customer list

        return;
      } catch (err: any) {
        // If 422, try fallback; else rethrow / show message
        const status = err?.response?.status;
        const respData = err?.response?.data;
        console.error("Error adding customer (JSON attempt):", err?.response || err);

        if (status !== 422) {
          // non-validation error — show the server response if available
          const msgs = extractValidationMessages(respData);
          alert(`Failed to add customer: ${msgs.join(" | ")}`);
          return;
        }

        // status === 422: validation error — inspect messages
        const validationMsgs = extractValidationMessages(respData);
        console.warn("Validation errors (JSON attempt):", validationMsgs);

        // Heuristic: if validation mentions files or logo/documents required, fallback to multipart
        const combinedText = JSON.stringify(respData).toLowerCase();
        const needsFiles =
          combinedText.includes("logo") ||
          combinedText.includes("document") ||
          combinedText.includes("file") ||
          combinedText.includes("attachment");

        if (!needsFiles) {
          // Backend rejected JSON for other reasons (field validation). Show messages so backend can be fixed.
          alert(
            `Validation failed: ${validationMsgs.slice(0, 5).join(" | ")}\n(See console for full response)`
          );
          return;
        }

        // FALLBACK: Server likely expects multipart/form-data with files — send FormData
        try {
          const fd = buildFormData(formData);
          console.log("Falling back to multipart/form-data. FormData entries:");
          for (const pair of fd.entries()) {
            console.log(pair[0], pair[1]);
          }

          // IMPORTANT: do NOT set Content-Type header for multipart — let browser set the boundary
          const res2 = await axios.post(
            "https://invoice-backend-604217703209.asia-south1.run.app/api/customers",
            fd,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                // no Content-Type here
              },
              withCredentials: true,
            }
          );

          console.log("✅ Customer added (multipart fallback):", res2.data);
          alert("Customer added successfully (with files)!");
          onCancel();
          return;
        } catch (err2: any) {
          console.error("Multipart fallback failed:", err2?.response || err2);
          const msgs2 = extractValidationMessages(err2?.response?.data);
          alert(
            `Failed to add customer after fallback: ${msgs2.slice(0, 5).join(" | ")}\n(See console for full response)`
          );
          return;
        }
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
