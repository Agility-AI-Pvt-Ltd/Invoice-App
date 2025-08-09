import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle, MapPin, Receipt, Info } from "lucide-react";
import { motion } from "framer-motion"; // Add this package if not installed

const steps = [
    { label: "Basic Information", icon: MapPin },
    { label: "Address Details", icon: MapPin },
    { label: "Tax and Other Details", icon: Receipt },
    { label: "Other Additional Info", icon: Info },
];

export default function StepIndicator({ currentStep }: { currentStep: number }) {
    return (
        <Card className="flex flex-col sm:flex-row items-center sm:justify-between px-4 sm:px-6 py-4 shadow-sm overflow-x-auto gap-4 sm:gap-0">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep - 1;
                const isActive = index === currentStep - 1;
                const Icon = step.icon;

                return (
                    <div key={index} className="flex-1 flex flex-col items-center relative min-w-[100px]">
                        {/* Progress line */}
                        {index !== steps.length - 1 && (
                            <div className="absolute top-4 left-1/2 w-full h-0.5 -translate-x-1/2 z-0 bg-gray-300 overflow-hidden">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        width:
                                            isCompleted || isActive
                                                ? isCompleted
                                                    ? "100%"
                                                    : "50%"
                                                : "0%",
                                        backgroundColor: isCompleted
                                            ? "#22c55e" // green-500
                                            : isActive
                                                ? "#3b82f6" // blue-500
                                                : "#d1d5db", // gray-300
                                    }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="h-0.5"
                                />
                            </div>
                        )}

                        {/* Step Icon */}
                        <motion.div
                            initial={false}
                            animate={{
                                backgroundColor: isCompleted
                                    ? "#dcfce7" // green-100
                                    : isActive
                                        ? "#ffffff"
                                        : "#f3f4f6", // gray-100
                                borderColor: isCompleted
                                    ? "#22c55e"
                                    : isActive
                                        ? "#3b82f6"
                                        : "#d1d5db",
                                color: isCompleted
                                    ? "#16a34a"
                                    : isActive
                                        ? "#3b82f6"
                                        : "#9ca3af",
                            }}
                            transition={{ duration: 0.4 }}
                            className={cn(
                                "z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center"
                            )}
                        >
                            {isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <Icon className="w-4 h-4" />
                            )}
                        </motion.div>

                        {/* Step Text */}
                        <div className="mt-2 text-center">
                            <p
                                className={cn(
                                    "text-xs font-medium whitespace-nowrap transition-colors duration-300",
                                    isCompleted
                                        ? "text-green-600"
                                        : isActive
                                            ? "text-blue-600"
                                            : "text-gray-400"
                                )}
                            >
                                STEP {index + 1}
                            </p>
                            <p
                                className={cn(
                                    "text-xs font-medium whitespace-nowrap transition-colors duration-300",
                                    isCompleted
                                        ? "text-green-600"
                                        : isActive
                                            ? "text-blue-600"
                                            : "text-gray-400"
                                )}
                            >
                                {step.label}
                            </p>
                            <p
                                className={cn(
                                    "text-[10px] font-semibold mt-1 transition-colors duration-300",
                                    isCompleted
                                        ? "text-green-600"
                                        : isActive
                                            ? "text-blue-600"
                                            : "text-gray-400"
                                )}
                            >
                                {isCompleted ? "Completed" : isActive ? "In Progress" : "Pending"}
                            </p>
                        </div>
                    </div>
                );
            })}
        </Card>
    );
}
