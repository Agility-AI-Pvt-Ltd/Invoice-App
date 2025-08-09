"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { ChevronDown } from "lucide-react";

export default function Step1Form() {
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
            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
          />
        </div>

        {/* Payment Terms */}
        <div className="space-y-2 relative">
          <Label htmlFor="paymentTerms" className="text-sm font-medium text-foreground">
            Payment Terms
          </Label>
          <div className="relative">
            <select
              id="paymentTerms"
              className="h-11 px-3 pr-10 text-sm border border-input bg-background placeholder:text-slate-400 appearance-none w-full rounded-md"
              defaultValue=""
            >
              <option value="" disabled className="text-slate-400">
                Select
              </option>
              <option value="net15">Net 15</option>
              <option value="net30">Net 30</option>
              <option value="net60">Net 60</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>
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
              defaultValue=""
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
              defaultValue=""
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
            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
}
