import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { ChevronDown } from "lucide-react";

type Step1Props = {
  data: {
    expenseNumber?: string;
    invoiceNumber?: string;
    expenseDate?: string;
    dueDate?: string;
    paymentMethod?: string;
    currency?: string;
    status?: string;
    notes?: string;
  };
  onChange: (partial: Partial<any>) => void;
};

export default function Step1Form({ data = {}, onChange }: Step1Props) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Expense Number */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="expenseNumber" className="text-sm font-medium text-foreground">
            Expense Number
          </Label>
          <Input
            id="expenseNumber"
            placeholder="INXXXX"
            className="h-11 px-3 text-sm placeholder:text-muted-foreground"
            value={data.expenseNumber || ""}
            onChange={(e) => onChange({ expenseNumber: e.target.value })}
          />
        </div>

        {/* Invoice Number */}
        <div className="flex flex-col space-y-1 relative">
          <Label htmlFor="invoiceNumber" className="text-sm font-medium text-foreground">
            Invoice Number (Vendor's Bill)
          </Label>
          <div className="relative">
            <select
              id="invoiceNumber"
              className="h-11 px-3 pr-10 text-sm border border-input bg-background placeholder:text-muted-foreground appearance-none w-full rounded-md"
              value={data.invoiceNumber || ""}
              onChange={(e) => onChange({ invoiceNumber: e.target.value })}
            >
              <option value="" disabled>
                Select
              </option>
              <option value="inv001">INV001</option>
              <option value="inv002">INV002</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>
        </div>

        {/* Expense Date */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="expenseDate" className="text-sm font-medium text-foreground">
            Expense Date
          </Label>
          <Input
            id="expenseDate"
            type="date"
            placeholder="Pick the Date"
            className="h-11 px-3 text-sm placeholder:text-muted-foreground"
            value={data.expenseDate || ""}
            onChange={(e) => onChange({ expenseDate: e.target.value })}
          />
        </div>

        {/* Due Date */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">
            Due Date
          </Label>
          <Input
            id="dueDate"
            type="date"
            placeholder="date"
            className="h-11 px-3 text-sm placeholder:text-muted-foreground"
            value={data.dueDate || ""}
            onChange={(e) => onChange({ dueDate: e.target.value })}
          />
        </div>

        {/* Payment Method */}
        <div className="flex flex-col space-y-1 relative">
          <Label htmlFor="paymentMethod" className="text-sm font-medium text-foreground">
            Payment Method
          </Label>
          <div className="relative">
            <select
              id="paymentMethod"
              className="h-11 px-3 pr-10 text-sm border border-input bg-background appearance-none w-full rounded-md text-muted-foreground"
              value={data.paymentMethod || ""}
              onChange={(e) => onChange({ paymentMethod: e.target.value })}
            >
              <option value="" disabled>
                Select
              </option>
              <option value="online">Online</option>
              <option value="pos">POS</option>
              <option value="cash">Cash</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
          </div>
        </div>

        {/* Currency */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="currency" className="text-sm font-medium text-foreground">
            Currency
          </Label>
          <Input
            id="currency"
            placeholder="INR"
            className="h-11 px-3 text-sm placeholder:text-muted-foreground"
            value={data.currency || ""}
            onChange={(e) => onChange({ currency: e.target.value })}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col space-y-1 relative">
          <Label htmlFor="status" className="text-sm font-medium text-foreground">
            Status
          </Label>
          <div className="relative">
            <select
              id="status"
              className="h-11 px-3 pr-10 text-sm border border-input bg-background appearance-none w-full rounded-md text-muted-foreground"
              value={data.status || ""}
              onChange={(e) => onChange({ status: e.target.value })}
            >
              <option value="" disabled>
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

        {/* Notes/Remarks */}
        <div className="flex flex-col space-y-1">
          <Label htmlFor="notes" className="text-sm font-medium text-foreground">
            Notes/Remarks
          </Label>
          <Input
            id="notes"
            placeholder="Notes"
            className="h-11 px-3 text-sm placeholder:text-muted-foreground"
            value={data.notes || ""}
            onChange={(e) => onChange({ notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
