// FILE : client/src/components/invoice-form/Step1Form.tsx

import { useContext } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { ChevronDown } from "lucide-react";
import { InvoiceContext } from "@/contexts/InvoiceContext";

export default function Step1Form() {
  const ctx = useContext(InvoiceContext) as any | undefined;

  // helper to safely set invoice fields when context is available
  const setField = (key: string, value: any) => {
    if (!ctx) return;
    ctx.setInvoice((prev: any) => ({ ...prev, [key]: value }));

    // clear inline error for this field if present
    // For nested fields, callers should pass keys like "billTo.name"
    const fieldPath = key;
    if (typeof ctx.clearFieldError === "function") {
      ctx.clearFieldError(fieldPath);
    }
  };

  const invoice = ctx?.invoice ?? {};
  const fieldErrors = ctx?.fieldErrors ?? {};

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Number */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber" className="text-sm font-medium text-foreground">
            Invoice Number
          </Label>
          <Input
            id="invoiceNumber"
            placeholder="INXXXX"
            className="h-11 px-3 text-sm border border-input bg-background placeholder:text-slate-400"
            value={invoice.invoiceNumber ?? ""}
            onChange={(e) => setField("invoiceNumber", e.target.value)}
            aria-invalid={!!fieldErrors["invoiceNumber"]}
          />
          {fieldErrors["invoiceNumber"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["invoiceNumber"]}</p>
          )}
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
              value={invoice.paymentTerms ?? ""}
              onChange={(e) => setField("paymentTerms", e.target.value)}
              aria-invalid={!!fieldErrors["paymentTerms"]}
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
          {fieldErrors["paymentTerms"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["paymentTerms"]}</p>
          )}
        </div>

        {/* Invoice Date (MANDATORY) */}
        <div className="space-y-2">
          <Label htmlFor="invoiceDate" className="text-sm font-medium text-foreground">
            Invoice Date
            <span className="text-red-600 ml-1 text-sm" aria-hidden>
              *
            </span>
          </Label>
          <Input
            id="invoiceDate"
            type="date"
            placeholder="Pick the Date"
            className="h-11 px-3 text-sm border border-input bg-background placeholder:text-slate-400"
            value={invoice.date ?? ""}
            onChange={(e) => setField("date", e.target.value)}
            aria-invalid={!!fieldErrors["date"]}
          />
          {fieldErrors["date"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["date"]}</p>
          )}
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">
            Due Date
          </Label>
          <Input
            id="dueDate"
            type="date"
            placeholder="Pick the Date"
            className="h-11 px-3 text-sm border border-input bg-background placeholder:text-slate-400"
            value={invoice.dueDate ?? ""}
            min={invoice.date || ""} // ✅ Prevent selecting before invoiceDate
            onChange={(e) => setField("dueDate", e.target.value)}
            aria-invalid={!!fieldErrors["dueDate"]}
          />
          {fieldErrors["dueDate"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["dueDate"]}</p>
          )}
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
              value={invoice.status ?? ""}
              onChange={(e) => setField("status", e.target.value)}
              aria-invalid={!!fieldErrors["status"]}
            >
              <option value="" disabled className="text-slate-400">
                Select
              </option>
              <option value="paid">Paid</option>
              {/* <option value="unpaid">Unpaid</option> */}
              <option value="pending">Pending</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>
          {fieldErrors["status"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["status"]}</p>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency" className="text-sm font-medium text-foreground">
            Currency
          </Label>
          <Input
            id="currency"
            placeholder="INR"
            className="h-11 px-3 text-sm border border-input bg-background placeholder:text-slate-400"
            value={invoice.currency ?? ""}
            onChange={(e) => setField("currency", e.target.value)}
            aria-invalid={!!fieldErrors["currency"]}
          />
          {fieldErrors["currency"] && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors["currency"]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
