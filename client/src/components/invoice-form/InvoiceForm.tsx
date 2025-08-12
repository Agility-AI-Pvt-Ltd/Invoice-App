import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1Form from "./Step1Form";
import Step2Form from "./Step2Form";
import Step3Form from "./Step3Form";
import Step4Form from "./Step4Form";
import { BanknoteX, CurlyBraces, LocationEdit, Pin } from "lucide-react";

type Props = {
    onCancel: () => void;
};

const steps = [
    { label: "Invoice Details", icon: Pin },
    { label: "Party Details", icon: LocationEdit },
    { label: "Item Details", icon: BanknoteX },
    { label: "Sub Total", icon: CurlyBraces },
];

export default function InvoiceForm({ onCancel }: Props) {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    return (
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
                                onClick={() => console.log("Save and send")}
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
