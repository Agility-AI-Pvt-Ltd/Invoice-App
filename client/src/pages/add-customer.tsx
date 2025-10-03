import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1Form from "@/components/customer-form/Step1Form";
import Step2Form from "@/components/customer-form/Step2Form";
import Step3Form from "@/components/customer-form/Step3Form";
import Step4Form from "@/components/customer-form/Step4Form";
import { InfoIcon, MapPin, Receipt } from "lucide-react";
import { useFormPersistence } from "@/hooks/useFormPersistence";

type Props = {
  onCancel: () => void;
  initialData?: any;
};

const steps = [
  { label: "Basic Information", icon: MapPin },
  { label: "Address Details", icon: MapPin },
  { label: "Tax and Other Details", icon: Receipt },
  { label: "Other Additional Info", icon: InfoIcon },
];

export default function MultiStepForm({ onCancel, initialData }: Props) {
  const [step, setStep] = useState(1);

  // Generate unique form ID for draft persistence
  const formId = `customer-form-${initialData?.id ? `edit-${initialData.id}` : 'new'}`;

  // Default form data structure
  const defaultFormData = {
    // Step 1
    customerType: initialData?.customerType || "",
    name: initialData?.fullName || initialData?.name || "",  // Changed from fullName to name
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    companyName: initialData?.companyName || "",
    website: initialData?.website || "",

    // Step 2
    billingAddress: initialData?.billingAddress || "",
    billingAddressLine1: initialData?.billingAddressLine1 || "",
    billingAddressLine2: initialData?.billingAddressLine2 || "",
    billingCity: initialData?.billingCity || "",
    billingState: initialData?.billingState || "",
    billingZip: initialData?.billingZip || "",
    billingCountry: initialData?.billingCountry || "",
    shippingAddress: initialData?.shippingAddress || "",
    shippingAddressLine1: initialData?.shippingAddressLine1 || "",
    shippingAddressLine2: initialData?.shippingAddressLine2 || "",
    shippingCity: initialData?.shippingCity || "",
    shippingState: initialData?.shippingState || "",
    shippingZip: initialData?.shippingZip || "",
    shippingCountry: initialData?.shippingCountry || "",

    // Step 3
    pan: initialData?.pan || "",
    documents: initialData?.documents || [],
    gstRegistered: initialData?.gstRegistered || "",
    gstNumber: initialData?.gstNumber || "",
    supplyPlace: initialData?.supplyPlace || "",
    currency: initialData?.currency || "INR",
    paymentTerms: initialData?.paymentTerms || "",

    // Step 4
    logo: null,
    notes: initialData?.notes || "",
    tags: initialData?.tags || "",

    // Keep original ID for updates
    id: initialData?.id,
  };

  // 🔹 Use form persistence hook for draft functionality
  const {
    formData,
    setFormData,
    hasSavedState,
    clearSavedState,
  } = useFormPersistence({
    formId,
    initialData: defaultFormData,
    autoSave: true,
    autoSaveDelay: 1000,
    onRestore: (restoredData) => {
      console.log('📂 Customer form draft restored:', restoredData);
    }
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

  // Handle cancel with draft cleanup
  const handleCancel = () => {
    clearSavedState(); // Clear the draft when user cancels
    onCancel();
  };

  const nextStep = async () => {
    if (step === 4) {
      // Build a JSON payload without file binaries first (logo/documents removed or normalized)
      const buildJsonPayloadNoFiles = (raw: any) => {
        // Map frontend form fields to backend API fields
        const payload: any = {
          // Basic Information - map to backend expected fields
          name: raw.name || "",  // Changed from raw.fullName to raw.name
          email: raw.email || "",
          phone: raw.phone || "",
          address: raw.billingAddress || raw.billingAddressLine1 || "",
          company: raw.companyName || "",
          gstNumber: raw.gstNumber || "",
          panNumber: raw.pan || "",
          
          // Additional fields that might be expected
          customerType: raw.customerType || "",
          website: raw.website || "",
          
          // Address details
          billingAddress: raw.billingAddress || "",
          billingAddressLine1: raw.billingAddressLine1 || "",
          billingAddressLine2: raw.billingAddressLine2 || "",
          billingCity: raw.billingCity || "",
          billingState: raw.billingState || "",
          billingZip: raw.billingZip || "",
          billingCountry: raw.billingCountry || "",
          
          shippingAddress: raw.shippingAddress || "",
          shippingAddressLine1: raw.shippingAddressLine1 || "",
          shippingAddressLine2: raw.shippingAddressLine2 || "",
          shippingCity: raw.shippingCity || "",
          shippingState: raw.shippingState || "",
          shippingZip: raw.shippingZip || "",
          shippingCountry: raw.shippingCountry || "",
          
          // Tax details
          gstRegistered: raw.gstRegistered || "",
          supplyPlace: raw.supplyPlace || "",
          currency: raw.currency || "INR",
          paymentTerms: raw.paymentTerms || "",
          
          // Additional info
          notes: raw.notes || "",
          tags: raw.tags || "",
        };

        // Remove or normalize file fields so we send pure JSON
        if (raw.logo instanceof File) {
          // remove file binary for JSON attempt — backend may handle files separately
          // payload.logo will be undefined
        } else {
          // keep value if it's string/null
          payload.logo = raw.logo ?? null;
        }

        if (Array.isArray(raw.documents) && raw.documents.length > 0) {
          // If documents contain File objects, remove them for JSON attempt
          const docs = raw.documents.filter((d: any) => !(d instanceof File));
          payload.documents = docs;
        } else {
          payload.documents = [];
        }

        return payload;
      };


      // FIRST: try sending JSON (without files) — many backends expect JSON for customer create/update
      try {
        const payloadJson = buildJsonPayloadNoFiles(formData);
        
        // Debug logging to see what we're sending
        console.log("🔍 Raw form data:", formData);
        console.log("🚀 Payload being sent to backend:", payloadJson);
        console.log("📧 Name field:", payloadJson.name);
        console.log("📧 Email field:", payloadJson.email);
        
        const isEditing = initialData && (initialData.id || initialData._id);
        const customerId = isEditing ? (initialData.id || initialData._id) : null;
        
        const { createCustomer, updateCustomer } = await import("@/services/api/customer");
        
        const res = isEditing 
          ? await updateCustomer(customerId, payloadJson)
          : await createCustomer(payloadJson);

        console.log(`✅ Customer ${isEditing ? 'updated' : 'added'} successfully`);

        // Clear draft data on successful save
        clearSavedState();

        // dispatch global event so lists can refresh (no UI change)
        const eventName = isEditing ? "customer:updated" : "customer:added";
        window.dispatchEvent(new CustomEvent(eventName, { detail: res }));

        alert(`Customer ${isEditing ? 'updated' : 'added'} successfully!`);
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

        // For now, just show the validation error. 
        // File upload support can be added later if needed.
        alert(
          `Validation failed: ${validationMsgs.slice(0, 5).join(" | ")}\n(See console for full response)`
        );
        return;
      }
    } else {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="p-8">
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
          onClick={handleCancel}
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
