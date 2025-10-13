// File: client/src/components/sales-form/Step1Form.tsx

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { ChevronDown } from "lucide-react";

type StepProps = {
  data?: Record<string, any>;
  onChange?: (partial: Record<string, any>) => void;
};

function formatDateForInput(value: any) {
  if (!value) return "";
  try {
    if (typeof value === "string") {
      // already YYYY-MM-DD or ISO
      if (value.includes("T")) return value.split("T")[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      return "";
    }
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return "";
  } catch {
    return "";
  }
}

export default function Step1Form({ data = {}, onChange }: StepProps) {
  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Number */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber" className="text-sm font-medium text-foreground">
            Invoice Number
          </Label>
          <Input
            id="invoiceNumber"
            placeholder="INXXXX"
            value={data?.invoiceNumber ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.({ invoiceNumber: e.target.value })}
            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
          />
        </div>


        {/* Sales Date */}
        <div className="space-y-2">
          <Label htmlFor="salesDate" className="text-sm font-medium text-foreground">
            Sales Date
          </Label>
          <Input
            id="salesDate"
            type="date"
            placeholder="Pick the Date"
            value={formatDateForInput(data?.salesDate)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.({ salesDate: e.target.value })}
            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
          />
        </div>

        {/* Sales Due Date */}
        <div className="space-y-2">
          <Label htmlFor="salesDueDate" className="text-sm font-medium text-foreground">
            Sales Due Date
          </Label>
          <Input
            id="salesDueDate"
            type="date"
            placeholder="date"
            value={formatDateForInput(data?.salesDueDate)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.({ salesDueDate: e.target.value })}
            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
          />
        </div>

        {/* Salesperson */}
        <div className="space-y-2 relative">
          <Label htmlFor="salesperson" className="text-sm font-medium text-foreground">
            Salesperson
          </Label>
          <div className="relative">
            <select
              id="salesperson"
              className="h-11 px-3 pr-10 text-sm border border-input bg-background placeholder:text-slate-400 appearance-none w-full rounded-md"
              value={data?.salesperson ?? ""}
              onChange={(e) => onChange?.({ salesperson: e.target.value })}
              aria-label="Salesperson"
            >
              <option value="" disabled className="text-slate-400">
                Select
              </option>
              {/* Add salesperson options here */}
              <option value="johnDoe">John Doe</option>
              <option value="janeDoe">Jane Doe</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>
        </div>

        {/* Sales Channel */}
        <div className="space-y-2">
          <Label htmlFor="salesChannel" className="text-sm font-medium text-foreground">
            Sales Channel
          </Label>
          <Input
            id="salesChannel"
            placeholder="Online, POS etc."
            value={data?.salesChannel ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.({ salesChannel: e.target.value })}
            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
          />
        </div>

        {/* Status */}
        <div className="space-y-2 relative">
          <Label htmlFor="status" className="text-sm font-medium text-foreground">
            Status
          </Label>
          <div className="relative">
            <select
              id="status"
              className="h-11 px-3 pr-10 text-sm border border-input bg-background placeholder:text-slate-400 appearance-none w-full rounded-md"
              value={data?.status ?? ""}
              onChange={(e) => onChange?.({ status: e.target.value })}
              aria-label="Invoice status"
            >
              <option value="" disabled className="text-slate-400">
                Select
              </option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency" className="text-sm font-medium text-foreground">
            Currency
          </Label>
          <Input
            id="currency"
            placeholder="INR"
            value={data?.currency ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.({ currency: e.target.value })}
            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
}
