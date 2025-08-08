import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1Form from "@/components/customer-form/Step1Form";
import Step2Form from "@/components/customer-form/Step2Form";
import Step3Form from "@/components/customer-form/Step3Form";
import Step4Form from "@/components/customer-form/Step4Form";
import { InfoIcon, MapPin, Receipt } from "lucide-react";

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

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    return (
        <div className="mx-auto p-8">
            <StepIndicator currentStep={step} steps={steps}/>

            <div className="mt-6">
                {step === 1 && <Step1Form />}
                {step === 2 && <Step2Form />}
                {step === 3 && <Step3Form />}
                {step === 4 && <Step4Form />}
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
