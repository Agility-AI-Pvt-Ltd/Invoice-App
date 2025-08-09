"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle } from 'lucide-react';
import { motion } from "framer-motion";
import React from "react"; // Import React for React.ElementType

interface Step {
  label: string;
  icon: React.ElementType;
}

export default function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: Step[];
}) {
  return (
    <Card className="grid grid-flow-col auto-cols-fr sm:grid-cols-4 px-2 sm:px-6 py-2 sm:py-4 shadow-sm overflow-x-auto gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep - 1;
        const isActive = index === currentStep - 1;
        const Icon = step.icon;
        return (
          <div
            key={index}
            className="flex flex-col items-center relative min-w-[80px] sm:min-w-[100px]"
          >
            {/* Progress line */}
            {index !== steps.length - 1 && (
              <div className="absolute top-3 sm:top-4 left-[calc(50%+14px)] w-[calc(50%-14px)] h-0.5 z-0 bg-gray-300 sm:left-[calc(50%+16px)] sm:w-[calc(50%-16px)]">
                <motion.div
                  initial={false}
                  animate={{
                    width:
                      isCompleted || isActive
                        ? isCompleted
                          ? "110%" // increased length from 100% to 110%
                          : "60%"
                        : "0%",
                    backgroundColor: isCompleted
                      ? "#15803d"
                      : isActive
                        ? "#3b82f6"
                        : "#d1d5db",
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
                  ? "#dcfce7"
                  : isActive
                    ? "#ffffff"
                    : "#f3f4f6",
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
                "z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center"
              )}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </motion.div>
            {/* Step Text */}
            <div className="mt-1 text-center">
              <p
                className={cn(
                  "text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-300",
                  isCompleted
                    ? "text-green-600"
                    : isActive
                      ? "text-blue-600"
                      : "text-gray-400"
                )}
              >
                S{index + 1}
              </p>
              <p
                className={cn(
                  "text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-300",
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
                  "text-[9px] sm:text-[10px] font-semibold mt-0.5 transition-colors duration-300",
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
